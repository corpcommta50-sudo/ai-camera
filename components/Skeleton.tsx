// Loading Skeleton Component
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-12 w-24 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
