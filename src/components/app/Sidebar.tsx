'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  FileText,
  WandSparkles,
  NotebookPen,
  BriefcaseBusiness,
  FileSearch,
  ReceiptText,
  Settings,
  Sparkles,
  LifeBuoy,
  TrendingUp,
  LogOut,
  MessageCircleQuestion,
  HandCoins,
  SendHorizonal,
} from 'lucide-react';
import { SignOutButton } from '@/components/app/SignOutButton';
import styles from './Sidebar.module.css';

// Force cache invalidation
interface SidebarProps {
  userName: string | null;
  plan: string;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyzer', label: 'Job Fit Analyzer', icon: Target },
  { href: '/resume', label: 'Resume & Evidence', icon: FileText },
  { href: '/tailor', label: 'Resume Tailoring', icon: WandSparkles },
  { href: '/cover-letter', label: 'Cover Letter', icon: NotebookPen },
  { href: '/outreach', label: 'Outreach Copilot', icon: SendHorizonal },
  { href: '/interview-prep', label: 'Interview Prep', icon: MessageCircleQuestion },
  { href: '/offer-evaluation', label: 'Offer & Negotiation', icon: HandCoins },
  { href: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/tracker', label: 'Pipeline Tracker', icon: FileSearch },
  { href: '/digest', label: 'Daily Digest', icon: ReceiptText },
  { href: '/support', label: 'Support', icon: LifeBuoy },
];

export default function Sidebar({ userName, plan }: SidebarProps) {
  const pathname = usePathname();
  const isPaidPlan = plan === 'pro' || plan === 'premium';
  const planLabel = plan === 'premium' ? 'Premium' : plan === 'pro' ? 'Pro' : 'Free Plan';

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-50 flex-col bg-[#1c1c1a] border-r border-white/[0.08] overflow-y-auto no-scrollbar">
        {/* Brand */}
        <Link href="/dashboard" className="block px-6 py-5" aria-label="WorthApply dashboard home">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="WorthApply"
              width={1080}
              height={1080}
              priority
              className={styles.logoImage}
            />
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white">WorthApply</span>
              <span className="text-[9px] font-semibold text-[#fdba9f] uppercase tracking-widest">Master Your Job Search</span>
            </div>
          </div>
        </Link>

        {/* User Card */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/[0.06] rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9d6148] to-[#d7a189] flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-white uppercase">
                {(userName || 'U')[0]}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">
                {userName || 'WorthApply User'}
              </p>
              <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isPaidPlan
                  ? 'text-[#fdba9f]'
                  : 'bg-white/[0.06] text-[#a9a29c]'
              }`}>
                {isPaidPlan ? (
                  <><TrendingUp className="w-2.5 h-2.5" /> {planLabel}</>
                ) : (
                  planLabel
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#a9a29c] hover:bg-white/[0.05] hover:text-[#e9e1dc]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/15'
                    : 'bg-white/[0.06] group-hover:bg-white/10'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 pt-4 border-t border-white/[0.08] flex flex-col gap-3">
          {!isPaidPlan && (
            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-5">
                <Sparkles className="w-24 h-24 -mr-4 -mt-4" />
              </div>
              <p className="text-[11px] font-black text-[#fdba9f] uppercase tracking-widest mb-1">
                Pro Workspace
              </p>
              <p className="text-xs text-white/60 mb-3 leading-relaxed">
                Unlock unlimited analyses, tailoring & cover letters.
              </p>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-secondary text-on-secondary rounded-lg text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
              >
                <Sparkles className="w-3 h-3" /> Upgrade
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/settings'
                  ? 'bg-white/[0.08] text-white'
                  : 'text-[#a9a29c] hover:bg-white/[0.05] hover:text-[#e9e1dc]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </Link>
            <SignOutButton className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#a9a29c] hover:bg-red-900/20 hover:text-red-400 transition-all w-full text-left">
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </SignOutButton>
          </div>
        </div>
      </aside>

      <aside className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#1c1c1a]/95 backdrop-blur-md shadow-[0_-12px_36px_rgba(0,0,0,0.3)]">
        <nav className="flex items-stretch gap-2 overflow-x-auto px-3 py-3 pb-safe no-scrollbar" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-w-[84px] flex-1 rounded-2xl px-3 py-2.5 flex flex-col items-center justify-center gap-1.5 text-[11px] font-bold tracking-tight transition-all ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-[#a9a29c] bg-white/[0.06] border border-white/[0.08]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <SignOutButton className="min-w-[84px] flex-1 rounded-2xl px-3 py-2.5 flex flex-col items-center justify-center gap-1.5 text-[11px] font-bold tracking-tight transition-all text-[#a9a29c] bg-white/[0.06] border border-white/[0.08] hover:text-red-400 hover:bg-red-900/20">
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-center leading-tight">Sign Out</span>
          </SignOutButton>
        </nav>
      </aside>
    </>
  );
}
