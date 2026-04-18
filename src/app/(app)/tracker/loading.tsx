import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function TrackerLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
