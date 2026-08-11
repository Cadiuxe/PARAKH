import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { ProficiencyCard } from "@/components/dashboard/proficiency-card";
import { TopicCards } from "@/components/dashboard/topic-cards";
import { AbilityChart } from "@/components/dashboard/ability-chart";
import { RecentAssessments } from "@/components/dashboard/recent-assessments";
import { InsightsSection } from "@/components/dashboard/insights-section";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <WelcomeSection />

        {/* Top Analytics Grid: Proficiency Card + Ability Trajectory Recharts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <ProficiencyCard />
          </div>
          <div className="lg:col-span-7">
            <AbilityChart />
          </div>
        </div>

        {/* Topic Breakdown */}
        <TopicCards />

        {/* Recent Assessment Sessions */}
        <RecentAssessments />

        {/* AI Insights & Diagnostic Recommendations */}
        <InsightsSection />
      </div>
    </DashboardLayout>
  );
}
