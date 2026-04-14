import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Target,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Zap,
  CheckCircle,
  Activity,
  WandSparkles,
  Inbox,
} from "lucide-react";
import {
  APPLICATION_STATUS_META,
  normalizeApplicationStatus,
  isActiveApplicationStatus,
  isInterviewStageStatus,
  type ApplicationStatus,
} from '@/lib/application-status';

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: analyses } = await supabase
    .from("job_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const normalizedApplications: Array<{
    id: string;
    job_title: string;
    company: string;
    created_at: string;
    status: ApplicationStatus;
    interview_date?: string | null;
  }> = (applications || []).map((application) => ({
    ...application,
    status: normalizeApplicationStatus(application.status),
  }));

  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const totalApplications = normalizedApplications.length;
  const activeApplications = normalizedApplications.filter((app) => isActiveApplicationStatus(app.status)).length;
  const interviewCount = normalizedApplications.filter((app) => isInterviewStageStatus(app.status)).length;
  const successRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;
  const scheduledInterviews = normalizedApplications.filter((app) => app.interview_date && new Date(app.interview_date) > new Date()).length;
  const wishlistCount = normalizedApplications.filter((app) => app.status === "wishlist").length;

  const recentAnalyses = analyses?.slice(0, 5) || [];
  const recentApplications = normalizedApplications.slice(0, 5);

  const pipelineStages = [
    { label: "Wishlist", count: normalizedApplications.filter((a) => a.status === "wishlist").length, color: "bg-amber-400" },
    { label: "Applied", count: normalizedApplications.filter((a) => a.status === "applied").length, color: "bg-blue-500" },
    { label: "Interview", count: normalizedApplications.filter((a) => a.status === "interview").length, color: "bg-purple-500" },
    { label: "Offer", count: normalizedApplications.filter((a) => a.status === "offer").length, color: "bg-emerald-500" },
    { label: "Rejected", count: normalizedApplications.filter((a) => a.status === "rejected").length, color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-secondary mb-2">
            WorthApply / Dashboard
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-on-surface-variant mt-1 text-base">
            {totalApplications === 0
              ? "Ready to start your job search? Let's analyze your first role."
              : `You have ${activeApplications} active application${activeApplications !== 1 ? "s" : ""} in progress.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/analyzer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold hover:bg-[#1c1c1a]/90 active:scale-95 transition-all shadow-lg"
          >
            <Target className="w-4 h-4" />
            Analyze a Job
          </Link>
          <Link
            href="/resume"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-on-surface rounded-xl text-sm font-bold border border-outline-variant/30 hover:bg-surface-container-low active:scale-95 transition-all"
          >
            <WandSparkles className="w-4 h-4 text-secondary" />
            Tailor Resume
          </Link>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Active Applications */}
        <div className="bg-[#1c1c1a] text-white rounded-2xl p-6 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Active
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black">{activeApplications}</span>
            <p className="text-sm text-white/50 mt-1">Applications</p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
              Success Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black text-on-surface">{successRate}%</span>
            <p className="text-sm text-on-surface-variant mt-1">Interview rate</p>
          </div>
        </div>

        {/* Analyses Run */}
        <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Analyses
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
              <Target className="w-4 h-4 text-on-surface-variant" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black text-on-surface">{analyses?.length || 0}</span>
            <p className="text-sm text-on-surface-variant mt-1">Jobs analyzed</p>
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div className="bg-white rounded-2xl p-6 border border-secondary/20 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
              Upcoming
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div>
            <span className="text-4xl font-black text-on-surface">{scheduledInterviews}</span>
            <p className="text-sm text-on-surface-variant mt-1">Interviews</p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* Pipeline Overview */}
          {totalApplications > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-on-surface">Pipeline Overview</h2>
                <Link
                  href="/tracker"
                  className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                  Full Pipeline <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex gap-2 mb-4">
                {pipelineStages.map((stage) => (
                  <div key={stage.label} className="flex-1 text-center">
                    <div className={`h-2 rounded-full ${stage.count > 0 ? stage.color : "bg-surface-container"} mb-2`} />
                    <span className="text-lg font-black text-on-surface">{stage.count}</span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">{stage.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Job Analyses */}
          <div className="bg-white rounded-2xl border border-outline-variant/20">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-lg font-bold text-on-surface">Recent Analyses</h2>
              <Link
                href="/analyzer"
                className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                New Analysis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {recentAnalyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-on-surface-variant" />
                  </div>
                  <p className="font-bold text-on-surface mb-1">No analyses yet</p>
                  <p className="text-sm text-on-surface-variant mb-6 max-w-xs">
                    Paste a job description to see how well you match and get actionable insights.
                  </p>
                  <Link
                    href="/analyzer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1c1c1a] text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
                  >
                    <Target className="w-4 h-4" /> Analyze Your First Job
                  </Link>
                </div>
              ) : (
                recentAnalyses.map((analysis, index) => {
                  const score = analysis.match_score || analysis.overall_score || 0;
                  const scoreColor = score >= 80 ? "text-green-700 bg-green-50 border-green-200" :
                    score >= 60 ? "text-blue-700 bg-blue-50 border-blue-200" :
                    "text-amber-700 bg-amber-50 border-amber-200";
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm truncate">
                          {analysis.job_title || "Job Analysis"}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {analysis.company_name} · {getTimeAgo(analysis.created_at)}
                        </p>
                      </div>
                      {score > 0 && (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${scoreColor} shrink-0`}>
                          {score}% Match
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Applications */}
          {recentApplications.length > 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/20">
              <div className="flex justify-between items-center p-6 pb-4">
                <h2 className="text-lg font-bold text-on-surface">Recent Applications</h2>
                <Link
                  href="/applications"
                  className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {recentApplications.map((app, index) => {
                  const cfg = APPLICATION_STATUS_META[app.status];
                  return (
                    <Link
                      key={index}
                      href={`/applications/${app.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                        <span className="text-sm font-black text-on-surface-variant uppercase">
                          {(app.company || "?")[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-on-surface text-sm truncate">
                          {app.job_title}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {app.company} · {getTimeAgo(app.created_at)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeTextColor} shrink-0`}>
                        {cfg.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="xl:col-span-4 flex flex-col gap-6">

          {/* Action CTA */}
          <div className="bg-[#1c1c1a] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-[0.04] pointer-events-none">
              <Zap className="w-40 h-40 -mr-8 -mt-8" />
            </div>
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3">
                Recommended
              </p>
              <h3 className="text-white text-xl font-bold mb-2 leading-snug">
                {totalApplications === 0
                  ? "Analyze your first role today"
                  : "Keep momentum going"}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                {totalApplications === 0
                  ? "Upload your resume and paste a job description to see your match score instantly."
                  : `You've run ${analyses?.length || 0} analyses. Your evidence bank is ready for tailoring.`}
              </p>
              <Link
                href="/analyzer"
                className="flex items-center gap-2 w-fit px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-black uppercase tracking-wide hover:opacity-90 active:scale-95 transition-all"
              >
                <Target className="w-4 h-4" />
                {totalApplications === 0 ? "Get Started" : "New Analysis"}
              </Link>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl p-6 border border-outline-variant/20">
            <h2 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              Next Steps
            </h2>
            <div className="flex flex-col gap-3">
              {wishlistCount > 0 && (
                <Link
                  href="/applications"
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-secondary/15 hover:bg-secondary/10 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {wishlistCount} wishlist item{wishlistCount !== 1 ? "s" : ""} ready
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Move your best roles into active applications</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              <Link
                href="/resume"
                className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-on-surface">Tailor your resume</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Boost match scores by 20%+</p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/cover-letter"
                className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-on-surface">Write a cover letter</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">AI-generated from your evidence</p>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-secondary/20 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">
              Did You Know
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed italic">
              &ldquo;Tailored resumes with specific outcome-based evidence see a 40% higher response rate.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
