import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function AnalyzerLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Form Skeleton */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-8 mb-8">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-48 w-full mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        {/* Previous Analyses Skeleton */}
        <div className="mt-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}
