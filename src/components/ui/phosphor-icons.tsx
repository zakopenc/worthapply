'use client';

// Re-export all Phosphor icons used in server component pages.
// Importing from this file (instead of @phosphor-icons/react directly) ensures
// that Phosphor's internal createContext call only runs in a client bundle context,
// avoiding "createContext is not a function" errors in Next.js server components.

export type { Icon, IconProps } from '@phosphor-icons/react';
export {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Buildings,
  GraduationCap,
  Link,
  Megaphone,
  UserCircle,
  CalendarBlank,
  ChartBar,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  Copy,
  FileMagnifyingGlass,
  FileText,
  Lightning,
  Question,
  Scan,
  SealCheck,
  ShieldCheck,
  Sparkle,
  Star,
  Tag,
  Target,
  TrendUp,
  Users,
  Warning,
  X,
  XCircle,
} from '@phosphor-icons/react';
