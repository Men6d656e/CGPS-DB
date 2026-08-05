import { useEffect, useState } from 'react'
import { Users, UserCheck, FileText, TrendingUp, Banknote, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { dashboardApi, invoicesApi } from '../api'
import { PageLoader } from '../components/UI'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200/60 rounded-xl px-4 py-3 text-sm shadow-lg">
        <p className="text-gray-400 mb-1 text-xs">{label}</p>
        <p className="text-gray-800 font-semibold">PKR {Number(payload[0].value).toLocaleString()}</p>
      </div>
    )
  }
  return null
}

const statusBadge = {
  paid: 'badge-paid',
  pending: 'badge-pending',
  partial: 'badge-partial',
  overdue: 'badge-overdue',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, invoicesRes, collectionsRes] = await Promise.all([
          dashboardApi.stats(),
          invoicesApi.list({ limit: 5 }),
          dashboardApi.monthlyCollections(6),
        ])
        setStats(statsRes.data)
        setRecentInvoices(invoicesRes.data)

        const formatted = collectionsRes.data.map(item => {
          const date = new Date(item.month + '-01')
          return { month: date.toLocaleString('default', { month: 'short' }), amount: Number(item.amount) }
        })
        setChartData(formatted)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const chartTeal = chartData
  const chartGreen = chartData.map(d => ({ ...d, amount: Math.round(d.amount * 0.7) }))
  const chartGray = chartData.map(d => ({ ...d, amount: Math.round(d.amount * 0.85) }))

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, trend: '+12%' },
    { label: 'Active Students', value: stats?.active_students || 0, icon: UserCheck, trend: '+8%' },
    { label: 'Collected (Month)', value: `PKR ${Number(stats?.total_collected_this_month || 0).toLocaleString()}`, icon: Banknote, trend: '+15%' },
    { label: 'Pending Amount', value: `PKR ${Number(stats?.total_pending_amount || 0).toLocaleString()}`, icon: Clock, trend: '-3%' },
  ]

  const summaryItems = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, dot: 'bg-teal-500' },
    { label: 'Active Students', value: stats?.active_students || 0, icon: CheckCircle, dot: 'bg-emerald-500' },
    { label: 'Parents', value: stats?.total_parents || 0, icon: UserCheck, dot: 'bg-teal-400' },
    { label: 'Pending Invoices', value: stats?.pending_invoices || 0, icon: FileText, dot: 'bg-amber-500' },
    { label: 'Overdue Invoices', value: stats?.overdue_invoices || 0, icon: AlertTriangle, dot: 'bg-red-400' },
    { label: 'Collected', value: `PKR ${Number(stats?.total_collected_this_month || 0).toLocaleString()}`, icon: Banknote, dot: 'bg-emerald-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4 Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, trend }) => (
          <div key={label} className="card p-4 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center stat-card-icon">
                <Icon size={20} className="text-teal-600" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                trend.startsWith('+')
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-red-500 bg-red-50'
              }`}>
                {trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* 3 Chart cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Teal chart */}
        <div className="card p-4 chart-card-teal">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Vibrant Teal</h3>
              <p className="text-xs text-gray-400">Revenue trend</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartTeal}>
                <defs>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#14b8a6" strokeWidth={2.5} fill="url(#gradTeal)" dot={{ fill: '#14b8a6', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-teal-500" style={{ width: '72%' }} />
          </div>
        </div>

        {/* Green chart */}
        <div className="card p-4 chart-card-green">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Rich Olive Green</h3>
              <p className="text-xs text-gray-400">Fee collection rate</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartGreen}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#65852a" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#65852a" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#65852a" strokeWidth={2.5} fill="url(#gradGreen)" dot={{ fill: '#65852a', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '65%', background: '#65852a' }} />
          </div>
        </div>

        {/* Charcoal chart */}
        <div className="card p-4 chart-card-charcoal">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Deep Charcoal Gray</h3>
              <p className="text-xs text-gray-400">Outstanding trend</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartGray}>
                <defs>
                  <linearGradient id="gradGray" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#475569" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#475569" strokeWidth={2.5} fill="url(#gradGray)" dot={{ fill: '#475569', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-slate-500" style={{ width: '58%' }} />
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Invoices + Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Invoices table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Projects</h3>
              <p className="text-xs text-gray-400">Recent invoices and billing</p>
            </div>
            <button className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="th">Invoice</th>
                  <th className="th">Student</th>
                  <th className="th">Month</th>
                  <th className="th">Amount</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-sm text-gray-400">No invoices yet</td>
                  </tr>
                )}
                {recentInvoices.map(inv => (
                  <tr key={inv.id} className="table-row">
                    <td className="td font-mono text-xs font-medium text-gray-500">#{String(inv.id).padStart(4, '0')}</td>
                    <td className="td font-medium text-gray-700">
                      {inv.student ? `${inv.student.first_name} ${inv.student.last_name}` : `Student #${inv.student_id}`}
                    </td>
                    <td className="td text-sm text-gray-500">{inv.billing_month}</td>
                    <td className="td font-mono font-medium text-gray-700">PKR {Number(inv.total_amount || 0).toLocaleString()}</td>
                    <td className="td">
                      <span className={statusBadge[inv.status] || 'badge bg-gray-100 text-gray-500'}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Overview */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Orders overview</h3>
          <p className="text-xs text-gray-400 mb-3">Quick stats at a glance</p>
          <div className="space-y-0">
            {summaryItems.map(({ label, value, dot }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 border-b border-gray-100/80 last:border-0">
                <div className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`} />
                <span className="text-sm text-gray-500 flex-1">{label}</span>
                <span className="text-sm font-semibold text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
