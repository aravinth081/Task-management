'use client';

import { motion } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Users, Mail, Shield, Crown, UserCheck } from 'lucide-react';
import { GradientButton, PageHeader, AvatarGroup } from '@/components/shared';

const teams = [
  {
    id: '1', name: 'Engineering', description: 'Core platform development team', color: '#2563EB',
    members: [
      { id: '1', name: 'Sarah Kim', role: 'Lead Engineer', avatar: undefined, online: true },
      { id: '2', name: 'Mike Rodriguez', role: 'Senior Backend', avatar: undefined, online: true },
      { id: '3', name: 'Lisa Morgan', role: 'Frontend Dev', avatar: undefined, online: false },
      { id: '4', name: 'John Davis', role: 'Full Stack', avatar: undefined, online: true },
      { id: '5', name: 'Amy Wilson', role: 'DevOps', avatar: undefined, online: false },
    ],
    projects: 8, activeSpints: 3,
  },
  {
    id: '2', name: 'Design', description: 'UI/UX and brand design team', color: '#EC4899',
    members: [
      { id: '6', name: 'Karen White', role: 'Design Lead', avatar: undefined, online: true },
      { id: '7', name: 'Leo Martinez', role: 'UI Designer', avatar: undefined, online: false },
      { id: '8', name: 'Diana Ross', role: 'UX Researcher', avatar: undefined, online: true },
    ],
    projects: 4, activeSpints: 1,
  },
  {
    id: '3', name: 'Product', description: 'Product management and strategy', color: '#22C55E',
    members: [
      { id: '9', name: 'Tom Chen', role: 'Product Manager', avatar: undefined, online: true },
      { id: '10', name: 'Anna Bell', role: 'Product Analyst', avatar: undefined, online: false },
    ],
    projects: 6, activeSpints: 2,
  },
  {
    id: '4', name: 'QA & Testing', description: 'Quality assurance and automation', color: '#F59E0B',
    members: [
      { id: '11', name: 'Chris Park', role: 'QA Lead', avatar: undefined, online: true },
      { id: '12', name: 'Eric Hu', role: 'QA Engineer', avatar: undefined, online: true },
      { id: '13', name: 'Frank Lee', role: 'Automation', avatar: undefined, online: false },
    ],
    projects: 5, activeSpints: 2,
  },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function TeamsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Teams"
        description="Manage your team structure and members"
        actions={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[rgba(255,255,255,0.15)] transition-all">
              <Mail className="w-4 h-4" /> Invite Members
            </button>
            <GradientButton icon={<Plus className="w-4 h-4" />}>New Team</GradientButton>
          </div>
        }
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Members', value: '38', color: '#2563EB' },
          { icon: Crown, label: 'Team Leads', value: '4', color: '#F59E0B' },
          { icon: UserCheck, label: 'Online Now', value: '12', color: '#22C55E' },
          { icon: Shield, label: 'Teams', value: teams.length.toString(), color: '#A78BFA' },
        ].map((stat) => (
          <div key={stat.label} className="card-premium p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#64748B]">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <motion.div key={team.id} variants={itemVariants}>
            <div className="card-premium p-6 h-full">
              {/* Team Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}99)`, boxShadow: `0 4px 15px ${team.color}30` }}
                  >
                    {team.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{team.name}</h3>
                    <p className="text-xs text-[#475569]">{team.description}</p>
                  </div>
                </div>
                <button className="p-1.5 text-[#475569] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-5 text-xs text-[#64748B]">
                <span>{team.members.length} members</span>
                <span>·</span>
                <span>{team.projects} projects</span>
                <span>·</span>
                <span>{team.activeSpints} active sprints</span>
              </div>

              {/* Members */}
              <div className="space-y-2.5">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background: `hsl(${member.name.charCodeAt(0) * 7 % 360}, 60%, 45%)`,
                          }}
                        >
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        {member.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-[#0F172A]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-[11px] text-[#475569]">{member.role}</p>
                      </div>
                    </div>
                    <button className="p-1 text-[#475569] hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
