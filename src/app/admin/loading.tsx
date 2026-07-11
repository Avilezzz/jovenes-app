import { Skeleton, AdminRowSkeleton } from "@/components/Skeletons";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-5 h-8 w-28 rounded-lg" />
      <div className="mb-8 flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>

      {/* Pestañas */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-xl" />
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
