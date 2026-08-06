import { Skeleton } from './ui/skeleton'
import { Card, CardContent } from './ui/card'

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-4 ${j === 0 ? 'w-1/4' : j === columns - 1 ? 'w-1/6' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-3 w-1/2 mb-2" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/4 mb-6" />
        <div className="flex items-end gap-2 h-48">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${30 + ((i * 53) % 60)}%` }} // deterministic pseudo-random heights
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-1/4 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}
