import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function ResumeLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Upload Section Skeleton */}
        <div className="bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant/30 p-12 mb-8">
          <div className="text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>

        {/* Resumes Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
