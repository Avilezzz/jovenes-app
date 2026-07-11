import { Skeleton, GroupCardSkeleton } from "@/components/Skeletons";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-5 h-8 w-28 rounded-lg" />
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {/* Formulario */}
      <section className="mb-12 rounded-2xl border border-border bg-surface p-6">
        <Skeleton className="mb-5 h-6 w-56" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="flex justify-end">
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Mis grupos */}
      <Skeleton className="mb-5 h-6 w-40" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
