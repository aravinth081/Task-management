'use client';

import { motion } from 'framer-motion';
import { useUIStore, useNotificationStore, useAuthStore } from '@/stores';
import {
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Command,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useRef, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export function Header() {
  const { toggleMobileMenu, toggleCommandPalette, toggleNotificationPanel } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { user, logout } = useAuthStore();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.06)] bg-[#050816]/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <button
            onClick={toggleCommandPalette}
            className="hidden md:flex items-center gap-3 px-4 py-2 text-sm text-[#64748B] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-all w-72"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search everything...</span>
            <div className="flex items-center gap-1">
              <kbd className="text-[10px] bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded font-mono">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="text-[10px] bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded font-mono">K</kbd>
            </div>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all w-[38px] h-[38px] flex items-center justify-center"
          >
            {!mounted ? (
              <div className="w-[18px] h-[18px]" />
            ) : theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Help */}
          <button className="hidden md:flex p-2.5 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all">
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          {/* Notifications */}
          <button
            onClick={toggleNotificationPanel}
            className="relative p-2.5 text-[#94A3B8] hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-[rgba(255,255,255,0.06)] mx-1 hidden md:block" />

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-blue-500/20 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-[#64748B] leading-tight">Super Admin</p>
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-[#64748B]" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl overflow-hidden shadow-2xl z-50"
              >
                <div className="p-3 border-b border-[rgba(255,255,255,0.06)]">
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-[#64748B] truncate">{user?.email || 'admin@taskflow.io'}</p>
                </div>
                <div className="p-1">
                  <DropdownItem icon={User} label="Profile" href="/settings" />
                  <DropdownItem icon={Settings} label="Settings" href="/settings" />
                </div>
                <div className="p-1 border-t border-[rgba(255,255,255,0.06)]">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  href,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
        danger
          ? 'text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]'
          : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}
