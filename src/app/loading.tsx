import { Skeleton, GroupGridSkeleton } from "@/components/Skeletons";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <Skeleton className="h-6 w-44 rounded-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-3/4" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-1 flex gap-3">
            <Skeleton className="h-12 w-44 rounded-xl" />
            <Skeleton className="h-12 w-36 rounded-xl" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Skeleton className="aspect-[3/2] w-full rounded-3xl" />
        </div>
      </section>

      {/* Franja de confianza */}
      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </section>

      {/* Grupos */}
      <section className="mt-12 pb-16">
        <div className="mb-6 flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <GroupGridSkeleton />
      </section>
    </div>
  );
}
