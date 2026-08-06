import { useEffect, useState } from 'react'
import { Users, UserCheck, FileText, AlertTriangle, TrendingUp, Banknote } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardApi, invoicesApi } from '../api'
import { StatCard, PageLoader, ErrorAlert } from '../components/UI'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-slate-100 font-medium">PKR {Number(payload[0].value).toLocaleString()}</p>
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
        <div className="card border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-center gap-4">
          <TrendingUp size={20} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">Outstanding Balance</p>
            <p className="text-xs text-slate-400">
              PKR {Number(stats.total_pending_amount).toLocaleString()} pending across all invoices
            </p>
          </div>
        </div>
      )}

      {/* Chart + Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-3 card p-5">
          <h3 className="font-display font-semibold text-slate-200 mb-1">Collections Overview</h3>
          <p className="text-xs text-slate-500 mb-5">Monthly fee collection (PKR)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? '#0ea5e9' : '#1e3a4f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent invoices */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-semibold text-slate-200 mb-1">Recent Invoices</h3>
          <p className="text-xs text-slate-500 mb-4">Latest 6 invoices</p>
          <div className="space-y-2">
            {recentInvoices.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No invoices yet</p>
            )}
            {recentInvoices.map((inv) => {
              const statusColor = {
                paid: 'text-emerald-400',
                pending: 'text-amber-400',
                partial: 'text-orange-400',
                overdue: 'text-red-400',
              }
              return (
                <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
                  <div>
                    <p className="text-sm text-slate-300">Invoice #{inv.id}</p>
                    <p className="text-xs text-slate-500">{inv.billing_month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-slate-200">
                      PKR {Number(inv.total_amount || 0).toLocaleString()}
                    </p>
                    <p className={`text-xs capitalize ${statusColor[inv.status]}`}>{inv.status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
