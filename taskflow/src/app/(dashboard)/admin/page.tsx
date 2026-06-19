'use client';

import { motion } from 'framer-motion';
import {
  Users, DollarSign, Shield, Activity, TrendingUp, ArrowUpRight,
  MoreHorizontal, Search, ChevronDown, AlertTriangle, CheckCircle2,
  Eye, Ban, Trash2, UserCheck, Globe, Clock,
} from 'lucide-react';
import { GlassCard, PageHeader, GradientButton } from '@/components/shared';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 12400, users: 120 },
  { month: 'Feb', revenue: 15600, users: 148 },
  { month: 'Mar', revenue: 18200, users: 175 },
  { month: 'Apr', revenue: 21800, users: 210 },
  { month: 'May', revenue: 25600, users: 256 },
  { month: 'Jun', revenue: 28400, users: 290 },
];

const users = [
  { id: '1', name: 'Sarah Kim', email: 'sarah@taskflow.io', role: 'Super Admin', status: 'Active', lastLogin: '2 min ago', plan: 'Enterprise' },
  { id: '2', name: 'Mike Rodriguez', email: 'mike@taskflow.io', role: 'Project Manager', status: 'Active', lastLogin: '1 hour ago', plan: 'Pro' },
  { id: '3', name: 'Lisa Morgan', email: 'lisa@company.com', role: 'Team Member', status: 'Active', lastLogin: '3 hours ago', plan: 'Pro' },
  { id: '4', name: 'John Davis', email: 'john@company.com', role: 'Team Member', status: 'Active', lastLogin: '1 day ago', plan: 'Starter' },
  { id: '5', name: 'Amy Wilson', email: 'amy@company.com', role: 'Team Member', status: 'Inactive', lastLogin: '7 days ago', plan: 'Starter' },
  { id: '6', name: 'Tom Chen', email: 'tom@startup.co', role: 'Project Manager', status: 'Active', lastLogin: '5 hours ago', plan: 'Pro' },
];

const auditLogs = [
  { id: '1', user: 'Sarah Kim', action: 'Updated project settings', entity: 'E-Commerce Platform', ip: '192.168.1.1', time: '2 min ago' },
  { id: '2', user: 'Mike Rodriguez', action: 'Created new task', entity: 'API rate limiting', ip: '10.0.0.15', time: '15 min ago' },
  { id: '3', user: 'Lisa Morgan', action: 'Invited team member', entity: 'Anna Bell', ip: '172.16.0.22', time: '1 hour ago' },
  { id: '4', user: 'John Davis', action: 'Deleted attachment', entity: 'old_spec.pdf', ip: '10.0.0.45', time: '3 hours ago' },
  { id: '5', user: 'System', action: 'Automated backup completed', entity: 'Database', ip: '127.0.0.1', time: '6 hours ago' },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name === 'Revenue' ? `$${p.value.toLocaleString()}` : p.value}</p>
      ))}
    </div>
  );
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Admin Panel"
        description="System administration and monitoring"
        actions={
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F59E0B] bg-[rgba(245,158,11,0.1)] rounded-full">
            <Shield className="w-3.5 h-3.5" /> Super Admin Access
          </span>
        }
      />

      {/* Admin Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: '2,847', change: '+12.5%', positive: true, color: '#2563EB' },
          { icon: DollarSign, label: 'Monthly Revenue', value: '$28,400', change: '+18.2%', positive: true, color: '#22C55E' },
          { icon: Globe, label: 'Active Workspaces', value: '342', change: '+8.1%', positive: true, color: '#A78BFA' },
          { icon: AlertTriangle, label: 'Open Issues', value: '12', change: '-3', positive: true, color: '#F59E0B' },
        ].map((stat) => (
          <div key={stat.label} className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                <ArrowUpRight className="w-3.5 h-3.5" />{stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-[#64748B] mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div variants={itemVariants}>
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Revenue & Growth</h3>
              <p className="text-xs text-[#475569] mt-0.5">Monthly revenue and user growth</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} name="Users" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* User Management & Audit Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Management */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">User Management</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
                <input type="text" placeholder="Search users..." className="pl-9 pr-3 py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] w-48 transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[#475569] border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left py-3 px-2 font-medium">User</th>
                    <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Role</th>
                    <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Plan</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Last Login</th>
                    <th className="py-3 px-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-semibold"
                            style={{ background: `hsl(${user.name.charCodeAt(0) * 7 % 360}, 60%, 45%)` }}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-[11px] text-[#475569]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <span className="text-xs text-[#94A3B8]">{user.role}</span>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          user.plan === 'Enterprise' ? 'text-[#A78BFA] bg-[rgba(167,139,250,0.1)]' :
                          user.plan === 'Pro' ? 'text-[#2563EB] bg-[rgba(37,99,235,0.1)]' :
                          'text-[#64748B] bg-[rgba(255,255,255,0.05)]'
                        }`}>{user.plan}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          user.status === 'Active' ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' : 'text-[#94A3B8] bg-[rgba(148,163,184,0.1)]'
                        }`}>{user.status}</span>
                      </td>
                      <td className="py-3 px-2 text-xs text-[#475569] hidden md:table-cell">{user.lastLogin}</td>
                      <td className="py-3 px-2">
                        <button className="p-1 text-[#475569] hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        {/* Audit Logs */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false} className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Audit Logs</h3>
              <button className="text-xs text-[#2563EB] hover:text-[#60A5FA] font-medium">View all</button>
            </div>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{log.user}</span>
                    <span className="text-[10px] text-[#475569]">{log.time}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    {log.action} — <span className="text-[#60A5FA]">{log.entity}</span>
                  </p>
                  <p className="text-[10px] text-[#475569] mt-1 font-mono">IP: {log.ip}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
