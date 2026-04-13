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
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

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
  { href: '/applications', label: 'Applications', icon: BriefcaseBusiness },
  { href: '/tracker', label: 'Pipeline Tracker', icon: FileSearch },
  { href: '/digest', label: 'Daily Digest', icon: ReceiptText },
];

export default function Sidebar({ userName, plan }: SidebarProps) {
  const pathname = usePathname();
  const isPro = plan === 'pro';

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col bg-[#fcf9f5] border-r border-[#cfc5bd]/20 overflow-y-auto no-scrollbar">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#cfc5bd]/15">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="WorthApply"
            width={130}
            height={32}
            priority
            className="logoImage"
          />
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 px-3 py-3 bg-surface-container-low rounded-xl border border-[#cfc5bd]/20">
          <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-secondary uppercase">
              {(userName || 'U')[0]}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-on-surface truncate">
              {userName || 'WorthApply User'}
            </p>
            <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isPro
                ? 'bg-secondary/15 text-secondary'
                : 'bg-surface-container text-on-surface-variant'
            }`}>
              {isPro ? (
                <><TrendingUp className="w-2.5 h-2.5" /> Pro</>
              ) : (
                'Free Plan'
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
                  ? 'bg-[#1c1c1a] text-white shadow-sm'
                  : 'text-[#4c4640] hover:bg-surface-container-low hover:text-[#1c1c1a]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isActive
                  ? 'bg-white/15'
                  : 'bg-surface-container group-hover:bg-surface-container-high'
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
      <div className="px-4 pb-6 pt-4 border-t border-[#cfc5bd]/15 flex flex-col gap-3">
        {/* Upgrade CTA for free users */}
        {!isPro && (
          <div className="p-4 rounded-xl bg-primary-container relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5">
              <Sparkles className="w-24 h-24 -mr-4 -mt-4" />
            </div>
            <p className="text-[11px] font-black text-secondary uppercase tracking-widest mb-1">
              Pro Workspace
            </p>
            <p className="text-xs text-on-primary-container/70 mb-3 leading-relaxed">
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

        {/* Settings & Support */}
        <div className="flex flex-col gap-0.5">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/settings'
                ? 'bg-surface-container-low text-on-surface'
                : 'text-[#4c4640] hover:bg-surface-container-low hover:text-[#1c1c1a]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </Link>
          <a
            href="mailto:hello@worthapply.com"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4c4640] hover:bg-surface-container-low hover:text-[#1c1c1a] transition-all"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
