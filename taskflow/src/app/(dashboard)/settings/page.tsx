'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  User, Building2, CreditCard, Shield, Bell, Palette, Globe, Key,
  Camera, Save, ChevronRight, Lock, Smartphone, Mail, Eye, EyeOff, Check
} from 'lucide-react';
import { GlassCard, GradientButton, PageHeader } from '@/components/shared';
import { useAuthStore } from '@/stores';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and workspace preferences" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <motion.div variants={itemVariants} className="lg:w-60 flex-shrink-0">
          <GlassCard hover={false} className="p-2">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB] font-medium'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </GlassCard>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'workspace' && <WorkspaceSettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [jobTitle, setJobTitle] = useState('Product Manager');
  const [department, setDepartment] = useState('Engineering');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern)');
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: fullName
        });
      }
      
      if (user) {
        setUser({
          ...user,
          name: fullName
        });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard hover={false}>
      <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              fullName.charAt(0) || 'A'
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1E293B] border border-[rgba(255,255,255,0.1)] rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white transition-all">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{user?.name || 'Admin User'}</h4>
          <p className="text-sm text-[#64748B]">{user?.email || 'admin@taskflow.io'}</p>
          <p className="text-xs text-[#475569] mt-1">Super Admin · Member since Jan 2026</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl text-[#64748B] cursor-not-allowed focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Timezone</label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
          />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
        <GradientButton onClick={handleSave} disabled={loading} icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}>
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </GradientButton>
      </div>
    </GlassCard>
  );
}

function WorkspaceSettings() {
  return (
    <GlassCard hover={false}>
      <h3 className="text-lg font-semibold text-white mb-6">Workspace Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsField label="Workspace Name" value="TaskFlow Enterprise" />
        <SettingsField label="Workspace URL" value="taskflow.app/enterprise" />
        <SettingsField label="Industry" value="Technology" />
        <SettingsField label="Team Size" value="38 members" />
      </div>
      <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
        <h4 className="text-sm font-semibold text-white mb-3">Danger Zone</h4>
        <div className="p-4 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)]">
          <p className="text-sm text-[#EF4444] font-medium">Delete Workspace</p>
          <p className="text-xs text-[#94A3B8] mt-1">Permanently delete this workspace and all associated data. This cannot be undone.</p>
          <button className="mt-3 px-4 py-2 text-xs font-medium text-[#EF4444] border border-[rgba(239,68,68,0.3)] rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-all">
            Delete Workspace
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <GlassCard hover={false}>
        <h3 className="text-lg font-semibold text-white mb-2">Current Plan</h3>
        <p className="text-xs text-[#475569] mb-6">Manage your subscription and billing</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '$12', desc: '5 Members · 10 Projects', current: false },
            { name: 'Pro', price: '$29', desc: '50 Members · Unlimited Projects', current: true },
            { name: 'Enterprise', price: '$79', desc: 'Unlimited Everything', current: false },
          ].map((plan) => (
            <div key={plan.name} className={`p-5 rounded-xl border transition-all ${
              plan.current
                ? 'border-[#2563EB] bg-[rgba(37,99,235,0.08)] glow-primary'
                : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
            }`}>
              {plan.current && <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-wider">Current Plan</span>}
              <h4 className="text-xl font-bold text-white mt-1">{plan.name}</h4>
              <p className="text-2xl font-bold text-white mt-2">{plan.price}<span className="text-sm text-[#64748B] font-normal">/mo</span></p>
              <p className="text-xs text-[#64748B] mt-2">{plan.desc}</p>
              <button className={`w-full mt-4 py-2 text-xs font-medium rounded-lg transition-all ${
                plan.current
                  ? 'bg-[rgba(255,255,255,0.05)] text-[#94A3B8] cursor-default'
                  : 'gradient-primary text-white shadow-lg shadow-blue-500/20'
              }`}>
                {plan.current ? 'Active' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-white mb-4">Billing History</h3>
        <div className="space-y-2">
          {[
            { date: 'Jun 1, 2026', amount: '$29.00', status: 'Paid' },
            { date: 'May 1, 2026', amount: '$29.00', status: 'Paid' },
            { date: 'Apr 1, 2026', amount: '$29.00', status: 'Paid' },
          ].map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors">
              <div>
                <p className="text-sm text-white font-medium">{inv.date}</p>
                <p className="text-xs text-[#475569]">Pro Plan - Monthly</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white">{inv.amount}</span>
                <span className="text-[10px] font-medium text-[#22C55E] bg-[rgba(34,197,94,0.1)] px-2 py-0.5 rounded-full">{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function SecuritySettings() {
  return (
    <GlassCard hover={false}>
      <h3 className="text-lg font-semibold text-white mb-6">Security Settings</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center"><Lock className="w-5 h-5 text-[#2563EB]" /></div>
            <div>
              <p className="text-sm font-medium text-white">Change Password</p>
              <p className="text-xs text-[#475569]">Last changed 30 days ago</p>
            </div>
          </div>
          <button className="text-xs text-[#2563EB] font-medium hover:text-[#60A5FA]">Update</button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center"><Smartphone className="w-5 h-5 text-[#22C55E]" /></div>
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-[#475569]">Add an extra layer of security</p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-[#22C55E] bg-[rgba(34,197,94,0.1)] rounded-lg hover:bg-[rgba(34,197,94,0.15)]">Enable</button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center"><Key className="w-5 h-5 text-[#F59E0B]" /></div>
            <div>
              <p className="text-sm font-medium text-white">API Keys</p>
              <p className="text-xs text-[#475569]">Manage API access tokens</p>
            </div>
          </div>
          <button className="text-xs text-[#2563EB] font-medium hover:text-[#60A5FA]">Manage</button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center"><Globe className="w-5 h-5 text-[#A78BFA]" /></div>
            <div>
              <p className="text-sm font-medium text-white">Active Sessions</p>
              <p className="text-xs text-[#475569]">2 active sessions</p>
            </div>
          </div>
          <button className="text-xs text-[#EF4444] font-medium hover:text-[#EF4444]">Revoke All</button>
        </div>
      </div>
    </GlassCard>
  );
}

function NotificationSettings() {
  return (
    <GlassCard hover={false}>
      <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
      <div className="space-y-4">
        {[
          { label: 'Task Assigned', desc: 'When a task is assigned to you', email: true, push: true, inApp: true },
          { label: 'Task Completed', desc: 'When a task you follow is completed', email: false, push: true, inApp: true },
          { label: 'Comments & Mentions', desc: 'When someone mentions you or comments', email: true, push: true, inApp: true },
          { label: 'Deadline Reminders', desc: 'Upcoming task deadlines', email: true, push: true, inApp: true },
          { label: 'Team Invitations', desc: 'When invited to a team or project', email: true, push: false, inApp: true },
          { label: 'Weekly Digest', desc: 'Weekly summary of your activity', email: true, push: false, inApp: false },
        ].map((notif) => (
          <div key={notif.label} className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.08)] transition-all">
            <div>
              <p className="text-sm font-medium text-white">{notif.label}</p>
              <p className="text-xs text-[#475569]">{notif.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <ToggleSwitch label="Email" checked={notif.email} />
              <ToggleSwitch label="Push" checked={notif.push} />
              <ToggleSwitch label="In-App" checked={notif.inApp} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function AppearanceSettings() {
  return (
    <GlassCard hover={false}>
      <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-white mb-3">Theme</p>
          <div className="flex gap-4">
            {[
              { name: 'Dark', bg: '#050816', active: true },
              { name: 'Light', bg: '#F8FAFC', active: false },
              { name: 'System', bg: 'linear-gradient(135deg, #050816 50%, #F8FAFC 50%)', active: false },
            ].map((t) => (
              <button key={t.name} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                t.active ? 'border-[#2563EB] bg-[rgba(37,99,235,0.08)]' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
              }`}>
                <div className="w-16 h-10 rounded-lg border border-[rgba(255,255,255,0.1)]" style={{ background: t.bg }} />
                <span className="text-xs text-[#94A3B8]">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white mb-3">Accent Color</p>
          <div className="flex gap-3">
            {['#2563EB', '#22C55E', '#A78BFA', '#EC4899', '#F59E0B', '#EF4444', '#14B8A6'].map((color) => (
              <button key={color} className={`w-8 h-8 rounded-lg transition-all ${color === '#2563EB' ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0F172A]' : 'hover:scale-110'}`} style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function SettingsField({ label, value, type = 'text' }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-[#64748B] mb-1.5 block">{label}</label>
      <input type={type} defaultValue={value} className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all" />
    </div>
  );
}

function ToggleSwitch({ label, checked }: { label: string; checked: boolean }) {
  const [on, setOn] = useState(checked);
  return (
    <button onClick={() => setOn(!on)} className="flex flex-col items-center gap-1">
      <div className={`w-8 h-4.5 rounded-full relative transition-colors ${on ? 'bg-[#2563EB]' : 'bg-[rgba(255,255,255,0.1)]'}`}>
        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${on ? 'left-[calc(100%-1rem)]' : 'left-0.5'}`} />
      </div>
      <span className="text-[10px] text-[#475569]">{label}</span>
    </button>
  );
}
