'use client';

import { motion } from 'framer-motion';
import { Download, Filter, Calendar, TrendingUp, Users, Target, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard, PageHeader, GradientButton } from '@/components/shared';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const productivityData = [
  { week: 'W1', score: 72, tasks: 45, hours: 160 },
  { week: 'W2', score: 78, tasks: 52, hours: 168 },
  { week: 'W3', score: 85, tasks: 61, hours: 155 },
  { week: 'W4', score: 82, tasks: 58, hours: 162 },
  { week: 'W5', score: 91, tasks: 68, hours: 170 },
  { week: 'W6', score: 88, tasks: 64, hours: 158 },
  { week: 'W7', score: 94, tasks: 72, hours: 165 },
  { week: 'W8', score: 90, tasks: 67, hours: 160 },
];

const teamData = [
  { name: 'Sarah K.', completed: 42, inProgress: 8, velocity: 38 },
  { name: 'Mike R.', completed: 38, inProgress: 12, velocity: 35 },
  { name: 'Lisa M.', completed: 35, inProgress: 6, velocity: 32 },
  { name: 'John D.', completed: 31, inProgress: 10, velocity: 28 },
  { name: 'Amy W.', completed: 28, inProgress: 5, velocity: 25 },
];

const workloadData = [
  { subject: 'Frontend', A: 85, fullMark: 100 },
  { subject: 'Backend', A: 72, fullMark: 100 },
  { subject: 'Design', A: 68, fullMark: 100 },
  { subject: 'DevOps', A: 45, fullMark: 100 },
  { subject: 'QA', A: 58, fullMark: 100 },
  { subject: 'Product', A: 62, fullMark: 100 },
];

const burndownData = [
  { day: 'D1', ideal: 80, actual: 80 },
  { day: 'D3', ideal: 70, actual: 72 },
  { day: 'D5', ideal: 60, actual: 65 },
  { day: 'D7', ideal: 50, actual: 55 },
  { day: 'D9', ideal: 40, actual: 48 },
  { day: 'D11', ideal: 30, actual: 38 },
  { day: 'D13', ideal: 20, actual: 25 },
  { day: 'D14', ideal: 10, actual: 18 },
];

const categoryData = [
  { name: 'Feature', value: 45, color: '#2563EB' },
  { name: 'Bug Fix', value: 22, color: '#EF4444' },
  { name: 'Improvement', value: 18, color: '#22C55E' },
  { name: 'Documentation', value: 8, color: '#F59E0B' },
  { name: 'Research', value: 7, color: '#A78BFA' },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[#94A3B8] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AnalyticsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track performance metrics and team productivity"
        actions={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[rgba(255,255,255,0.15)] transition-all">
              <Calendar className="w-4 h-4" /> Last 30 Days
            </button>
            <GradientButton icon={<Download className="w-4 h-4" />}>Export Report</GradientButton>
          </div>
        }
      />

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Productivity', value: '87%', change: '+5.2%', positive: true, icon: TrendingUp, color: '#2563EB' },
          { label: 'Tasks Completed', value: '487', change: '+12%', positive: true, icon: Target, color: '#22C55E' },
          { label: 'Team Velocity', value: '42 SP', change: '+3.1%', positive: true, icon: BarChart3, color: '#A78BFA' },
          { label: 'Avg Cycle Time', value: '3.2d', change: '-0.4d', positive: true, icon: Users, color: '#F59E0B' },
        ].map((kpi) => (
          <div key={kpi.label} className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${kpi.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {kpi.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-[#64748B] mt-1">{kpi.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="text-base font-semibold text-white mb-1">Productivity Trend</h3>
            <p className="text-xs text-[#475569] mb-4">Weekly productivity score over 8 weeks</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} fill="url(#prodGrad)" name="Score" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Sprint Burndown */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="text-base font-semibold text-white mb-1">Sprint Burndown</h3>
            <p className="text-xs text-[#475569] mb-4">Ideal vs actual remaining work</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="ideal" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal" />
                <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: '#2563EB', stroke: '#0F172A', strokeWidth: 2 }} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Team Performance */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="text-base font-semibold text-white mb-1">Team Performance</h3>
            <p className="text-xs text-[#475569] mb-4">Tasks completed per team member</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={teamData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="completed" fill="#2563EB" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="inProgress" fill="#F59E0B" radius={[4, 4, 0, 0]} name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Workload Radar + Category Pie */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false}>
            <h3 className="text-base font-semibold text-white mb-1">Workload Distribution</h3>
            <p className="text-xs text-[#475569] mb-4">By department utilization</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={280}>
                <RadarChart data={workloadData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Radar name="Utilization" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Task Categories</h4>
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs text-[#94A3B8]">{cat.name}</span>
                    </div>
                    <span className="text-xs font-medium text-white">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
