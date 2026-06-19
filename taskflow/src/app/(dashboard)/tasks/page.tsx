'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, MoreHorizontal, Calendar, CheckSquare,
  ArrowUpDown, Copy, Archive, Trash2, X
} from 'lucide-react';
import { GradientButton, PageHeader, StatusBadge, PriorityBadge, AvatarGroup } from '@/components/shared';
import { TaskStatus, Priority } from '@/types';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '@/stores';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [taskStoryPoints, setTaskStoryPoints] = useState('5');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Listen to all tasks
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const ts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(ts);
    });

    // 2. Listen to projects (for task creation mapping)
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });

    return () => {
      unsubTasks();
      unsubProjects();
    };
  }, [isAuthenticated]);

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelectedTasks((prev) => prev.length === filteredTasks.length ? [] : filteredTasks.map((t) => t.id));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedProjectId) return;
    setLoading(true);
    try {
      const projectObj = projects.find(p => p.id === selectedProjectId);
      const taskId = `task-${Date.now()}`;
      const number = 100 + Math.floor(Math.random() * 900);

      const taskData = {
        id: taskId,
        number,
        projectId: selectedProjectId,
        title: taskTitle,
        description: taskDesc,
        status: TaskStatus.TODO,
        priority: taskPriority,
        project: projectObj?.name || 'Project',
        projectKey: projectObj?.key || 'PRJ',
        dueDate: taskDueDate || 'Jun 30',
        assignees: [{ id: 'current-user', name: auth.currentUser?.displayName || 'You' }],
        comments: 0,
        attachments: 0,
        labels: [],
        storyPoints: parseInt(taskStoryPoints) || 5
      };

      await setDoc(doc(db, 'tasks', taskId), taskData);

      // Increment task count in project
      if (projectObj) {
        const projRef = doc(db, 'projects', selectedProjectId);
        await updateDoc(projRef, {
          taskCount: (projectObj.taskCount || 0) + 1
        });
      }

      // Log activity
      const activityId = `act-${Date.now()}`;
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        user: auth.currentUser?.displayName || 'User',
        action: 'created task',
        target: `${taskTitle} inside ${projectObj?.name || 'Project'}`,
        time: new Date().toISOString(),
        type: 'info'
      });

      // Reset
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority(Priority.MEDIUM);
      setTaskStoryPoints('5');
      setTaskDueDate('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const taskId of selectedTasks) {
        const task = tasks.find(t => t.id === taskId);
        await deleteDoc(doc(db, 'tasks', taskId));
        
        // Decrement task count in project
        if (task && task.projectId) {
          const projectObj = projects.find(p => p.id === task.projectId);
          if (projectObj) {
            const projRef = doc(db, 'projects', task.projectId);
            await updateDoc(projRef, {
              taskCount: Math.max(0, (projectObj.taskCount || 0) - 1),
              completedTaskCount: task.status === 'COMPLETED' 
                ? Math.max(0, (projectObj.completedTaskCount || 0) - 1)
                : (projectObj.completedTaskCount || 0)
            });
          }
        }
      }
      setSelectedTasks([]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'All') return matchesSearch;
    const mappedStatus = statusFilter.toUpperCase().replace(' ', '_');
    return matchesSearch && t.status === mappedStatus;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="View and manage all your assigned tasks"
        actions={
          <GradientButton onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>New Task</GradientButton>
        }
      />

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'To Do', 'In Progress', 'In Review', 'Completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                statusFilter === filter
                  ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]'
                  : 'text-[#64748B] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 glass rounded-xl"
        >
          <span className="text-sm text-white font-medium">{selectedTasks.length} selected</span>
          <div className="h-4 w-px bg-[rgba(255,255,255,0.1)]" />
          <button onClick={handleDeleteSelected} className="flex items-center gap-1.5 text-xs text-[#EF4444] hover:text-[#EF4444] px-2.5 py-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </motion.div>
      )}

      {/* Task Table */}
      <motion.div variants={itemVariants} className="glass rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] text-xs font-medium text-[#64748B] uppercase tracking-wider">
          <input
            type="checkbox"
            checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent accent-[#2563EB]"
          />
          <span className="flex-1">Task</span>
          <span className="w-28 hidden md:block">Status</span>
          <span className="w-24 hidden md:block">Priority</span>
          <span className="w-32 hidden lg:block">Project</span>
          <span className="w-20 hidden lg:block">Due Date</span>
          <span className="w-24 hidden xl:block">Assignee</span>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-4 px-4 py-3.5 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors group ${
                  selectedTasks.includes(task.id) ? 'bg-[rgba(37,99,235,0.05)]' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => {}} // handled by row click
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent accent-[#2563EB]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#475569] font-mono">{task.projectKey || 'TASK'}-{task.number}</span>
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#60A5FA] transition-colors">
                      {task.title}
                    </p>
                  </div>
                </div>
                <div className="w-28 hidden md:block"><StatusBadge status={task.status} /></div>
                <div className="w-24 hidden md:block"><PriorityBadge priority={task.priority} /></div>
                <div className="w-32 hidden lg:block">
                  <span className="text-xs text-[#94A3B8]">{task.project}</span>
                </div>
                <div className="w-20 hidden lg:block">
                  <span className="text-xs text-[#64748B]">{task.dueDate}</span>
                </div>
                <div className="w-24 hidden xl:block">
                  <AvatarGroup users={task.assignees || []} max={2} size="sm" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-sm text-[#475569]">No tasks found. Create a new one!</div>
          )}
        </div>
      </motion.div>

      {/* Task Creation Modal */}
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
              
              <h2 className="text-lg font-bold text-white mb-4">Create New Task</h2>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Task Title</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Implement OAuth Flow"
                    className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Description</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Describe the task details..."
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Project</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#0F172A] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as Priority)}
                      className="w-full px-4 py-2.5 text-sm bg-[#0F172A] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    >
                      <option value={Priority.LOW}>Low</option>
                      <option value={Priority.MEDIUM}>Medium</option>
                      <option value={Priority.HIGH}>High</option>
                      <option value={Priority.CRITICAL}>Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Story Points</label>
                    <input
                      type="number"
                      value={taskStoryPoints}
                      onChange={(e) => setTaskStoryPoints(e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Due Date</label>
                    <input
                      type="text"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      placeholder="e.g. Jun 15"
                      className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    />
                  </div>
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
                    {loading ? 'Creating...' : 'Create Task'}
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
