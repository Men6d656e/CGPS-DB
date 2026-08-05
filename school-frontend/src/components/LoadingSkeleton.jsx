export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-slate-700/50 rounded ${j === 0 ? 'w-1/4' : j === columns - 1 ? 'w-1/6' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-2" />
          <div className="h-6 bg-slate-700/50 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-700/50 rounded w-full" />
        <div className="h-3 bg-slate-700/50 rounded w-3/4" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-700/50 rounded-xl" />
        <div className="flex-1">
          <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-2" />
          <div className="h-5 bg-slate-700/50 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-2" />
      <div className="h-3 bg-slate-700/50 rounded w-1/4 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-slate-700/50 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-3 bg-slate-700/50 rounded w-1/4 mb-2" />
          <div className="h-10 bg-slate-700/50 rounded w-full" />
        </div>
      ))}
    </div>
  )
}
