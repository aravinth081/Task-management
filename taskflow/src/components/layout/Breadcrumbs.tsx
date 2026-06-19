'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'Tasks',
  calendar: 'Calendar',
  teams: 'Teams',
  messages: 'Messages',
  files: 'Files',
  analytics: 'Analytics',
  ai: 'AI Assistant',
  settings: 'Settings',
  admin: 'Admin Console',
  board: 'Kanban Board',
  new: 'Create',
  billing: 'Billing',
  security: 'Security',
  workspace: 'Workspace Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/verify-otp' || pathname === '/reset-password') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  const generateHref = (index: number) => {
    return '/' + segments.slice(0, index + 1).join('/');
  };

  const getSegmentLabel = (segment: string) => {
    // If segment is UUID or ID format (e.g. alphanumeric or numbers)
    if (/^[a-fA-F0-9-]{10,}$/.test(segment) || /^\d+$/.test(segment) || segment.length > 8) {
      return 'PRJ-101'; // Default placeholder name for project details
    }
    return routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-[#64748B] mb-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = generateHref(index);
        const isLast = index === segments.length - 1;
        const label = getSegmentLabel(segment);

        // Do not render duplicate dashboard if it's the first segment and we already have home
        if (segment === 'dashboard' && index === 0) return null;

        return (
          <div key={href} className="flex items-center space-x-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-[#334155] flex-shrink-0" />
            {isLast ? (
              <span className="font-semibold text-white tracking-wide">{label}</span>
            ) : (
              <Link href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
