import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome banner skeleton */}
        <div className="rounded-2xl border border-border/60 p-6 sm:p-8 bg-card space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* 2-column cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-2xl border border-border/60 p-6 bg-card space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="flex justify-center py-6">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="lg:col-span-8 rounded-2xl border border-border/60 p-6 bg-card space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>

        {/* Bottom row skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-2xl border border-border/60 p-6 bg-card space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-7 rounded-2xl border border-border/60 p-6 bg-card space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
