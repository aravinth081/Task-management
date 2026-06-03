'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef, type ReactNode } from 'react';

// ─── GlassCard ────────────────────────────────
interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'default', hover = true, glow = false, className, ...props }, ref) => {
    const variants = {
      default: 'glass',
      strong: 'glass-strong',
      subtle: 'glass-subtle',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          'rounded-xl p-6 transition-all duration-300',
          hover && 'hover:border-[rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.08)]',
          glow && 'glow-primary',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

// ─── Gradient Button ──────────────────────────
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'gradient-primary text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110',
    secondary:
      'bg-[#1E293B] text-white border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#334155]',
    outline:
      'bg-transparent text-white border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(37,99,235,0.4)]',
    ghost:
      'bg-transparent text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]',
  };

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ─── Status Badge ─────────────────────────────
import { statusColors, priorityColors } from '@/lib/constants';
import type { TaskStatus, Priority } from '@/types';

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusColors[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.text }}
      />
      {config.label}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────
export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityColors[priority];
  const labels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };
  const icons = { LOW: '↓', MEDIUM: '→', HIGH: '↑', CRITICAL: '⚡' };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{ background: config.bg, color: config.text, borderColor: config.border }}
    >
      <span>{icons[priority]}</span>
      {labels[priority]}
    </span>
  );
}

// ─── Animated Counter ─────────────────────────
export function AnimatedCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('tabular-nums', className)}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

// ─── Avatar Group ─────────────────────────────
interface AvatarGroupProps {
  users: { id: string; name: string; avatar?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 4, size = 'md' }: AvatarGroupProps) {
  const sizeClasses = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getColor = (name: string) => {
    const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    return `hsl(${hue}, 60%, 45%)`;
  };

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user) => (
        <div
          key={user.id}
          className={cn(
            sizeClasses[size],
            'rounded-full ring-2 ring-[#0F172A] flex items-center justify-center font-medium text-white flex-shrink-0'
          )}
          style={{ background: user.avatar ? undefined : getColor(user.name) }}
          title={user.name}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            'rounded-full ring-2 ring-[#0F172A] flex items-center justify-center font-medium text-[#94A3B8] bg-[#1E293B] flex-shrink-0'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton animate-pulse', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 glass rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center text-[#2563EB] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#94A3B8] text-sm max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  );
}

// ─── Page Header ──────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && (
          <p className="text-[#94A3B8] text-sm mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
}
