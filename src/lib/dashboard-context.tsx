"use client";

/**
 * PARAKH — Dashboard Context Provider & Hook
 * Phase 5.4: Database-backed Student Dashboard
 *
 * Provides database-persisted student assessment analytics to all dashboard components.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { getStudentDashboardData, StudentDashboardData } from "@/lib/actions/dashboard";

interface DashboardContextValue {
  data: StudentDashboardData | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue>({
  data: null,
  isLoading: true,
  refresh: async () => {},
});

export function DashboardProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: StudentDashboardData;
}) {
  const [data, setData] = useState<StudentDashboardData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  const loadData = async () => {
    try {
      const result = await getStudentDashboardData();
      setData(result);
    } catch (err) {
      console.error("Failed to load dashboard data from database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If no initialData was supplied by SSR or if client needs to re-sync
    if (!initialData) {
      loadData();
    }
  }, [initialData]);

  return (
    <DashboardContext.Provider value={{ data, isLoading, refresh: loadData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
