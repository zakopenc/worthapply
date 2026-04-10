import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton';

export default function ApplicationsLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-6">
          <SkeletonTable />
        </div>
      </div>
    </div>
  );
}
