import { redirect } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/login");
  }

  // Fetch applications data
  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch job analyses
  const { data: analyses } = await supabase
    .from("job_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Calculate statistics
  const activeApplications = applications?.filter(app => 
    ["applied", "interviewing", "screening"].includes(app.status)
  ).length || 0;

  const totalApplications = applications?.length || 0;
  const interviewCount = applications?.filter(app => 
    app.status === "interviewing"
  ).length || 0;
  
  const successRate = totalApplications > 0 
    ? Math.round((interviewCount / totalApplications) * 100)
    : 0;

  const scheduledInterviews = applications?.filter(app => 
    app.interview_date && new Date(app.interview_date) > new Date()
  ).length || 0;

  // Calculate average response time
  const respondedApps = applications?.filter(app => 
    app.response_date && app.created_at
  ) || [];
  
  const avgResponseDays = respondedApps.length > 0
    ? Math.round(
        respondedApps.reduce((sum, app) => {
          const diff = new Date(app.response_date).getTime() - new Date(app.created_at).getTime();
          return sum + (diff / (1000 * 60 * 60 * 24));
        }, 0) / respondedApps.length
      )
    : 0;

  // Get recent activities (analyses + applications)
  const recentActivities = [
    ...(analyses?.slice(0, 5).map(analysis => ({
      type: "analysis",
      title: `Analyzed ${analysis.job_title || "Job"}`,
      subtitle: `Match Score: ${analysis.match_score}% • ${getTimeAgo(analysis.created_at)}`,
      company: analysis.company_name,
      icon: "analytics",
      iconColor: "primary",
      timestamp: new Date(analysis.created_at),
    })) || []),
    ...(applications?.slice(0, 5).map(app => ({
      type: "application",
      title: app.status === "interviewing" ? "Interview scheduled" : "Application submitted",
      subtitle: `${app.company_name} • ${getTimeAgo(app.created_at)}`,
      company: app.company_name,
      icon: app.status === "interviewing" ? "videocam" : "send",
      iconColor: app.status === "interviewing" ? "green" : "secondary",
      timestamp: new Date(app.created_at),
    })) || []),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  // Get next steps based on real data
  const pendingAnalyses = analyses?.filter(a => !a.completed).length || 0;
  const incompleteApplications = applications?.filter(app => 
    app.status === "draft"
  ).length || 0;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-12">
        {/* Header & Breadcrumbs */}
        <header className="mb-8 lg:mb-12">
          <nav className="flex items-center gap-2 mb-4 text-xs font-label uppercase tracking-widest text-secondary">
            <span>WorthApply</span>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span className="text-on-surface/40">Dashboard</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
            Dashboard
          </h1>
        </header>

        {/* Bento Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <StatCard
            label="Active Applications"
            value={activeApplications.toString()}
            icon="folder_shared"
            variant="primary"
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            icon="trending_up"
            trend={successRate > 30 ? { value: "Good", direction: "up" } : undefined}
          />
          <StatCard
            label="Avg Response Time"
            value={avgResponseDays > 0 ? `${avgResponseDays} days` : "N/A"}
            icon="schedule"
          />
          <Card className="p-6 flex flex-col justify-between min-h-[160px] border-l-4 border-secondary">
            <span className="text-xs uppercase tracking-widest text-secondary font-bold">
              Scheduled
            </span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-on-surface">{scheduledInterviews}</span>
              <span className="material-symbols-outlined text-secondary">
                event_available
              </span>
            </div>
          </Card>
        </section>

        {/* Main Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-on-surface">
                  Recent Activity
                </h2>
                <Link 
                  href="/applications"
                  className="text-xs uppercase tracking-widest text-secondary font-bold hover:opacity-70 transition-opacity"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-6">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-on-surface/20 text-6xl mb-4">
                      inbox
                    </span>
                    <p className="text-on-surface/40">No activity yet. Start by analyzing a job!</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-lg ${
                        index === 0 
                          ? "bg-surface-container-low/50 border-l-2 border-primary" 
                          : "hover:bg-surface-container-low transition-colors"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${
                        activity.iconColor === "primary" ? "bg-primary/5" :
                        activity.iconColor === "green" ? "bg-green-100" :
                        "bg-secondary/10"
                      } flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined ${
                          activity.iconColor === "primary" ? "text-primary" :
                          activity.iconColor === "green" ? "text-green-600" :
                          "text-secondary"
                        } text-xl`}>
                          {activity.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-on-surface font-medium">
                          {activity.title}
                        </p>
                        <p className="text-sm text-on-surface/40 mt-1">
                          {activity.subtitle}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="material-symbols-outlined text-on-surface/20">
                          more_horiz
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Featured CTA */}
            <Card className="relative min-h-[180px] lg:h-48 bg-primary-container overflow-hidden group">
              <div
                className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)]"
                style={{ backgroundSize: "20px 20px" }}
              ></div>
              <div className="relative h-full flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-6">
                <h3 className="text-white text-2xl font-bold mb-2">
                  {totalApplications === 0 
                    ? "Start your job search journey"
                    : "Keep the momentum going"
                  }
                </h3>
                <p className="text-white/60 text-sm max-w-md">
                  {totalApplications === 0
                    ? "Upload your resume and analyze your first job to see how well you match."
                    : `You've analyzed ${analyses?.length || 0} jobs. Ready to find more opportunities?`
                  }
                </p>
                <a 
                  href="/analyzer"
                  className="mt-6 w-fit px-6 py-2 bg-secondary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  {totalApplications === 0 ? "Analyze First Job" : "Explore Opportunities"}
                </a>
              </div>
            </Card>
          </div>

          {/* Next Steps & Contextual Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="p-4 sm:p-6 lg:p-8 border-t-4 border-secondary">
              <h2 className="text-lg font-bold text-on-surface mb-6">
                Next Steps
              </h2>
              <div className="space-y-4">
                {pendingAnalyses > 0 && (
                  <a 
                    href="/analyzer"
                    className="block p-4 rounded-xl bg-secondary-container/30 border border-secondary/10 flex flex-col gap-3 group cursor-pointer hover:bg-secondary-container/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-on-secondary-container">
                        Complete {pendingAnalyses} pending {pendingAnalyses === 1 ? "analysis" : "analyses"}
                      </span>
                      <span className="material-symbols-outlined text-on-secondary-container text-sm">
                        arrow_forward
                      </span>
                    </div>
                    <p className="text-xs text-on-secondary-container/70 leading-relaxed">
                      Finish analyzing jobs to see your match scores.
                    </p>
                  </a>
                )}
                
                {incompleteApplications > 0 && (
                  <Link 
                    href="/applications"
                    className="block p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col gap-3 group cursor-pointer hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-on-surface">
                        Complete {incompleteApplications} draft {incompleteApplications === 1 ? "application" : "applications"}
                      </span>
                      <span className="material-symbols-outlined text-on-surface/30 text-sm">
                        arrow_forward
                      </span>
                    </div>
                    <p className="text-xs text-on-surface/40 leading-relaxed">
                      Finish and submit your pending applications.
                    </p>
                  </Link>
                )}

                {pendingAnalyses === 0 && incompleteApplications === 0 && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                    <span className="material-symbols-outlined text-green-600 text-2xl mb-2">
                      check_circle
                    </span>
                    <p className="text-sm font-medium text-green-800">
                      All caught up!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Great work staying on top of your applications.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Pro Tip */}
            <Card className="p-4 sm:p-6 lg:p-8 border-2 border-dashed border-outline-variant/30 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary">
                  bolt
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-secondary font-black mb-2">
                Pro Tip
              </span>
              <p className="text-sm italic text-on-surface/60">
                &ldquo;Resumes tailored with specific outcome-based evidence see a 40%
                higher response rate.&rdquo;
              </p>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 lg:mt-20 pt-8 lg:pt-12 border-t border-[#cfc5bd]/15 flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-6">
          <span className="text-[#1c1c1a]/40 dark:text-[#fcf9f5]/40 text-xs uppercase tracking-widest text-center md:text-left">
            © 2024 WorthApply. All rights reserved.
          </span>
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            <a href="/privacy" className="text-[#1c1c1a]/40 dark:text-[#fcf9f5]/40 text-xs uppercase tracking-widest hover:text-[#84523c] transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-[#1c1c1a]/40 dark:text-[#fcf9f5]/40 text-xs uppercase tracking-widest hover:text-[#84523c] transition-colors">
              Terms of Service
            </a>
            <a href="mailto:support@worthapply.com" className="text-[#1c1c1a]/40 dark:text-[#fcf9f5]/40 text-xs uppercase tracking-widest hover:text-[#84523c] transition-colors">
              Contact Us
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

// Helper function to get human-readable time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? "week" : "weeks"} ago`;
  return `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? "month" : "months"} ago`;
}
