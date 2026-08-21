import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ResultsView } from "@/components/results/results-view";
import { getSessionResult } from "@/lib/actions/results";

interface ResultsPageProps {
  searchParams: Promise<{ id?: string }>;
}

/**
 * Results page — async Server Component.
 *
 * Fetches session result data server-side (authenticated, ownership-verified)
 * and passes the pre-fetched data to the ResultsView client component.
 *
 * No result data comes from localStorage or client-provided session IDs.
 */
export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const sessionId = params?.id || null;

  // Server-side, ownership-verified fetch.
  const result = await getSessionResult(sessionId);

  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        }
      >
        <ResultsView initialResult={result} />
      </Suspense>
    </DashboardLayout>
  );
}
