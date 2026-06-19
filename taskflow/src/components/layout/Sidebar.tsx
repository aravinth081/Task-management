'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  FileBox,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  Search,
  Plus,
} from 'lucide-react';

const mainNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/projects', icon: FolderKanban },
  { title: 'My Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Calendar', href: '/calendar', icon: Calendar },
  { title: 'Teams', href: '/teams', icon: Users },
  { title: 'Messages', href: '/messages', icon: MessageSquare, badge: 3 },
];

const toolNavItems = [
  { title: 'AI Assistant', href: '/ai', icon: Sparkles },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Files', href: '/files', icon: FileBox },
];

const bottomNavItems = [
  { title: 'Admin', href: '/admin', icon: Shield },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  return (
    <motion.aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-[#0B1120] border-r border-[rgba(255,255,255,0.06)] transition-all duration-300 ease-in-out flex-shrink-0',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo Area */}
      <div className="flex items-center h-16 px-4 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <span className="text-base font-bold text-white tracking-tight">
                  TaskFlow
                </span>
                <span className="text-[10px] text-[#94A3B8] font-medium tracking-wider uppercase">
                  Enterprise
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Quick Actions */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] hover:text-white bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-all">
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="text-[10px] text-[#64748B] bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white gradient-primary rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className={cn('mb-2', !sidebarCollapsed && 'px-3')}>
          {!sidebarCollapsed && (
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              Main
            </span>
          )}
        </div>
        {mainNavItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} collapsed={sidebarCollapsed} />
        ))}

        <div className={cn('pt-4 mb-2', !sidebarCollapsed && 'px-3')}>
          {!sidebarCollapsed && (
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
              Tools
            </span>
          )}
        </div>
        {toolNavItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-3 border-t border-[rgba(255,255,255,0.06)] space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} collapsed={sidebarCollapsed} />
        ))}

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebarCollapse}
          className="w-full flex items-center gap-3 px-3 py-2 text-[#64748B] hover:text-[#94A3B8] rounded-lg transition-all hover:bg-[rgba(255,255,255,0.03)]"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

// ─── NavItem Component ────────────────────────
interface NavItemProps {
  item: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  };
  pathname: string;
  collapsed: boolean;
}

function NavItem({ item, pathname, collapsed }: NavItemProps) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'sidebar-item',
        isActive && 'active',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? item.title : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && item.badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-[#2563EB] text-white min-w-[20px] text-center">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
