import { useEffect, useState } from 'react'
import { Users, UserCheck, FileText, AlertTriangle, TrendingUp, Banknote } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardApi, invoicesApi } from '../api'
import { StatCard, PageLoader, ErrorAlert, STATUS_STYLES } from '../components/UI'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border rounded-lg px-4 py-3 text-sm shadow-xl">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="text-foreground font-medium">PKR {Number(payload[0].value).toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, invoicesRes, collectionsRes] = await Promise.all([
          dashboardApi.stats(),
          invoicesApi.list({ limit: 6 }),
          dashboardApi.monthlyCollections(6),
        ])
        setStats(statsRes.data)
        setRecentInvoices(invoicesRes.data)
        
        // Format the month (e.g. "2026-04" -> "Apr")
        const formattedChartData = collectionsRes.data.map(item => {
          const date = new Date(item.month + '-01')
          const monthName = date.toLocaleString('default', { month: 'short' })
          return { month: monthName, amount: Number(item.amount) }
        })
        setChartData(formattedChartData)
      } catch {
        setError('Failed to load dashboard data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />
  if (error) return <div className="mt-4"><ErrorAlert message={error} /></div>

  // Real chart data is loaded from API now

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Students" value={stats.total_students} icon={Users} color="brand" />
        <StatCard label="Active Students" value={stats.active_students} icon={Users} color="emerald" />
        <StatCard label="Parents" value={stats.total_parents} icon={UserCheck} color="brand" />
        <StatCard label="Pending Invoices" value={stats.pending_invoices} icon={FileText} color="gold" />
        <StatCard label="Overdue" value={stats.overdue_invoices} icon={AlertTriangle} color="red" />
        <StatCard
          label="Collected (Month)"
          value={`PKR ${Number(stats.total_collected_this_month).toLocaleString()}`}
          icon={Banknote}
          color="emerald"
        />
      </div>

      {/* Pending amount banner */}
      {Number(stats.total_pending_amount) > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="px-5 py-4 flex items-center gap-4">
            <TrendingUp size={20} className="text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning">Outstanding Balance</p>
              <p className="text-xs text-muted-foreground">
                PKR {Number(stats.total_pending_amount).toLocaleString()} pending across all invoices
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display">Collections Overview</CardTitle>
            <CardDescription>Monthly fee collection (PKR)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Recent Invoices</CardTitle>
            <CardDescription>Latest 6 invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentInvoices.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No invoices yet</p>
              )}
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm text-foreground">Invoice #{inv.id}</p>
                    <p className="text-xs text-muted-foreground">{inv.billing_month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">
                      PKR {Number(inv.total_amount || 0).toLocaleString()}
                    </p>
                    <Badge variant="outline" className={`capitalize ${STATUS_STYLES[inv.status]}`}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
