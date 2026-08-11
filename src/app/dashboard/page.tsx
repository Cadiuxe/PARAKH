import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { ProficiencyCard } from "@/components/dashboard/proficiency-card";
import { AbilityChart } from "@/components/dashboard/ability-chart";
import { InsightsSection } from "@/components/dashboard/insights-section";
import { TopicCards } from "@/components/dashboard/topic-cards";
import { RecentAssessments } from "@/components/dashboard/recent-assessments";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* 1. Welcome banner + primary CTA */}
        <WelcomeSection />

        {/* 2. Proficiency gauge + Ability trajectory side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <ProficiencyCard />
          </div>
          <div className="lg:col-span-8">
            <AbilityChart />
          </div>
        </div>

        {/* 3. Strengths & areas to improve */}
        <InsightsSection />

        {/* 4. Topic proficiency + recent sessions — compact row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <TopicCards />
          </div>
          <div className="lg:col-span-7">
            <RecentAssessments />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
