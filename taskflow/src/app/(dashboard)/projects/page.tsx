'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Calendar,
  Star,
  ArrowUpRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { GlassCard, GradientButton, AvatarGroup, PageHeader } from '@/components/shared';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useAuthStore } from '@/stores';

const colorChoices = ['#2563EB', '#A78BFA', '#22C55E', '#F59E0B', '#EC4899', '#60A5FA'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjKey, setNewProjKey] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjColor, setNewProjColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjKey) return;
    setLoading(true);
    try {
      const docId = `project-${Date.now()}`;
      const projectData = {
        id: docId,
        name: newProjName,
        key: newProjKey.toUpperCase(),
        description: newProjDesc,
        color: newProjColor,
        status: 'ACTIVE',
        priority: 'MEDIUM',
        taskCount: 0,
        completedTaskCount: 0,
        memberCount: 1,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        starred: false,
        members: [{ id: 'current-user', name: 'You' }]
      };
      
      await setDoc(doc(db, 'projects', docId), projectData);
      
      // Reset & Close
      setNewProjName('');
      setNewProjKey('');
      setNewProjDesc('');
      setNewProjColor('#2563EB');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track all your team projects"
        actions={
          <GradientButton onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            New Project
          </GradientButton>
        }
      />

      {/* Filters Bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[rgba(255,255,255,0.15)] transition-all">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <div className="flex items-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]' : 'text-[#64748B] hover:text-white'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]' : 'text-[#64748B] hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Projects list/grid */}
      {filteredProjects.length > 0 ? (
        view === 'grid' ? (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-3">
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <ProjectListItem project={project} />
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <div className="text-center py-16 text-sm text-[#475569]">No projects found. Create a new one!</div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-strong rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-lg font-bold text-white mb-4">Create New Project</h2>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Project Name</label>
                  <input
                    type="text"
                    value={newProjName}
                    onChange={(e) => {
                      setNewProjName(e.target.value);
                      if (e.target.value.length >= 3 && !newProjKey) {
                        setNewProjKey(e.target.value.slice(0, 3).toUpperCase());
                      }
                    }}
                    placeholder="e.g. Client Portal Redesign"
                    className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Project Key</label>
                    <input
                      type="text"
                      value={newProjKey}
                      onChange={(e) => setNewProjKey(e.target.value.toUpperCase())}
                      placeholder="e.g. CPR"
                      maxLength={5}
                      className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Color Theme</label>
                    <div className="flex gap-2 items-center h-10">
                      {colorChoices.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setNewProjColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${newProjColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Description</label>
                  <textarea
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Describe your project goals..."
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white bg-transparent rounded-xl border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.02)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-sm font-semibold text-white gradient-primary rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Project Card ─────────────────────────────
function ProjectCard({ project }: { project: any }) {
  const taskCount = project.taskCount || 0;
  const completedTaskCount = project.completedTaskCount || 0;
  const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  return (
    <div className="card-premium p-5 cursor-pointer group">
      <Link href={`/projects/${project.id}/board`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
              style={{ background: `linear-gradient(135deg, ${project.color || '#2563EB'}, ${(project.color || '#2563EB')}99)`, boxShadow: `0 4px 15px ${(project.color || '#2563EB')}30` }}
            >
              {(project.key || 'PR').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-[#60A5FA] transition-colors">
                {project.name}
              </h3>
              <span className="text-[11px] text-[#475569] uppercase tracking-wider">{project.key}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {project.starred && <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />}
          </div>
        </div>

        <p className="text-xs text-[#64748B] mb-4 line-clamp-2">{project.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#64748B]">Progress</span>
            <span className="font-medium text-white">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: project.color || '#2563EB' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#475569]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedTaskCount}/{taskCount}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {project.dueDate || 'No due date'}
            </span>
          </div>
          <AvatarGroup users={project.members || []} max={3} size="sm" />
        </div>

        {/* Status Tag */}
        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              project.status === 'ACTIVE' ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' :
              project.status === 'PAUSED' ? 'text-[#F59E0B] bg-[rgba(245,158,11,0.1)]' :
              project.status === 'COMPLETED' ? 'text-[#60A5FA] bg-[rgba(96,165,250,0.1)]' :
              'text-[#94A3B8] bg-[rgba(148,163,184,0.1)]'
            }`}>
              {(project.status || 'ACTIVE').replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#60A5FA] font-medium opacity-0 group-hover:opacity-100 transition-all">
              Open Board <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Project List Item ────────────────────────
function ProjectListItem({ project }: { project: any }) {
  const taskCount = project.taskCount || 0;
  const completedTaskCount = project.completedTaskCount || 0;
  const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  return (
    <div className="card-premium p-4 cursor-pointer group flex items-center gap-4">
      <Link href={`/projects/${project.id}/board`} className="flex flex-1 items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${project.color || '#2563EB'}, ${(project.color || '#2563EB')}99)` }}
        >
          {(project.key || 'PR').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white group-hover:text-[#60A5FA] transition-colors truncate">
            {project.name}
          </h3>
          <p className="text-xs text-[#475569] truncate">{project.description}</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#475569]">{progress}%</span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ background: project.color || '#2563EB', width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-[#475569] flex items-center gap-1 w-20">
            <CheckCircle2 className="w-3.5 h-3.5" /> {completedTaskCount}/{taskCount}
          </span>
          <AvatarGroup users={project.members || []} max={3} size="sm" />
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full w-24 text-center ${
            project.status === 'ACTIVE' ? 'text-[#22C55E] bg-[rgba(34,197,94,0.1)]' :
            project.status === 'PAUSED' ? 'text-[#F59E0B] bg-[rgba(245,158,11,0.1)]' :
            'text-[#60A5FA] bg-[rgba(96,165,250,0.1)]'
          }`}>
            {(project.status || 'ACTIVE').replace('_', ' ')}
          </span>
        </div>
      </Link>
      <button className="p-2 text-[#475569] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
