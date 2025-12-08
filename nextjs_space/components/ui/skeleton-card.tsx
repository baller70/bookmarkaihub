import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
  variant?: 'grid' | 'list' | 'compact'
}

export function SkeletonCard({ className, variant = 'grid' }: SkeletonCardProps) {
  if (variant === 'list') {
    return (
      <div className={cn('flex items-center gap-4 p-4 rounded-lg border bg-card animate-pulse', className)}>
        <div className="h-12 w-12 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-8 w-20 rounded bg-muted" />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('p-3 rounded-lg border bg-card animate-pulse', className)}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-2 w-1/3 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  // Default grid variant
  return (
    <div className={cn('p-4 rounded-xl border bg-card animate-pulse', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
        
        {/* Image placeholder */}
        <div className="h-32 w-full rounded-lg bg-muted" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        
        {/* Stats */}
        <div className="flex justify-between">
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-8 rounded bg-muted" />
          <div className="h-8 w-8 rounded bg-muted" />
          <div className="h-8 w-8 rounded bg-muted" />
          <div className="h-8 w-8 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  variant?: 'grid' | 'list' | 'compact'
  className?: string
}

export function SkeletonGrid({ count = 6, variant = 'grid', className }: SkeletonGridProps) {
  const gridClass = variant === 'list' 
    ? 'flex flex-col gap-3' 
    : variant === 'compact'
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'

  return (
    <div className={cn(gridClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  )
}

export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border bg-card animate-pulse">
          <div className="h-3 w-20 rounded bg-muted mb-2" />
          <div className="h-6 w-12 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-lg border bg-card animate-pulse', className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-24 rounded bg-muted" />
          <div className="h-8 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="h-64 w-full rounded bg-muted" />
    </div>
  )
}

