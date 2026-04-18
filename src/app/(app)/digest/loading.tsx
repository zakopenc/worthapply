import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function DigestLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
