'use client';

import { useState, useCallback, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Paperclip,
  ChevronLeft,
  SlidersHorizontal,
  Users,
  X
} from 'lucide-react';
import { GradientButton, PriorityBadge, AvatarGroup } from '@/components/shared';
import { TaskStatus, Priority } from '@/types';
import { statusColors } from '@/lib/constants';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, query, where, updateDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useAuthStore } from '@/stores';

interface BoardTask {
  id: string;
  number: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectKey?: string;
  assignees: Array<{ id: string; name: string; avatar?: string }>;
  comments: number;
  attachments: number;
  labels: Array<{ name: string; color: string }>;
  storyPoints?: number;
  dueDate?: string;
}

const columnOrder: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.TESTING,
  TaskStatus.COMPLETED,
];

const columnTitles: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'Backlog',
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.TESTING]: 'Testing',
  [TaskStatus.COMPLETED]: 'Completed',
};

export default function KanbanBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Task Creation Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [taskStoryPoints, setTaskStoryPoints] = useState('5');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('1');
  const [modalLoading, setModalLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Fetch Project Details
    const unsubProject = onSnapshot(doc(db, 'projects', id), (docSnap) => {
      if (docSnap.exists()) {
        setProjectInfo(docSnap.data());
      }
    });

    // 2. Fetch Project Tasks
    const qTasks = query(collection(db, 'tasks'), where('projectId', '==', id));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const ts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardTask[];
      setTasks(ts);
    });

    return () => {
      unsubProject();
      unsubTasks();
    };
  }, [id, isAuthenticated]);

  // Group tasks by status
  const columns: Record<TaskStatus, { title: string; tasks: BoardTask[] }> = columnOrder.reduce((acc, colId) => {
    acc[colId] = {
      title: columnTitles[colId],
      tasks: tasks.filter(t => t.status === colId && (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
    };
    return acc;
  }, {} as Record<TaskStatus, { title: string; tasks: BoardTask[] }>);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId as TaskStatus;
    const destCol = destination.droppableId as TaskStatus;

    // Optimistically update status in Firestore
    try {
      const taskDocRef = doc(db, 'tasks', draggableId);
      await updateDoc(taskDocRef, { status: destCol });
      
      // If task was completed, increment project's completedTaskCount
      if (destCol === TaskStatus.COMPLETED && sourceCol !== TaskStatus.COMPLETED) {
        const projRef = doc(db, 'projects', id);
        await updateDoc(projRef, {
          completedTaskCount: (projectInfo?.completedTaskCount || 0) + 1
        });
      } else if (sourceCol === TaskStatus.COMPLETED && destCol !== TaskStatus.COMPLETED) {
        const projRef = doc(db, 'projects', id);
        await updateDoc(projRef, {
          completedTaskCount: Math.max(0, (projectInfo?.completedTaskCount || 0) - 1)
        });
      }

      // Log movement activity
      const activityId = `act-${Date.now()}`;
      const taskObj = tasks.find(t => t.id === draggableId);
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        user: auth.currentUser?.displayName || 'User',
        action: `moved task to ${columnTitles[destCol]}`,
        target: taskObj?.title || 'task',
        time: new Date().toISOString(),
        type: destCol === TaskStatus.COMPLETED ? 'success' : 'info'
      });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  }, [id, projectInfo, tasks]);

  const projectMembers = projectInfo?.members || [
    { id: '1', name: 'Sarah Kim' },
    { id: '2', name: 'Mike Rodriguez' },
    { id: '3', name: 'Lisa Morgan' }
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    setModalLoading(true);
    try {
      const taskId = `task-${Date.now()}`;
      const number = 100 + Math.floor(Math.random() * 900);
      const chosenAssignee = projectMembers.find((m: any) => m.id === assigneeId) || projectMembers[0];

      const taskData = {
        id: taskId,
        number,
        projectId: id,
        title: taskTitle,
        description: taskDesc,
        status: TaskStatus.TODO,
        priority: taskPriority,
        project: projectInfo?.name || 'Project',
        projectKey: projectInfo?.key || 'PRJ',
        dueDate: taskDueDate || 'Jun 30',
        assignees: [chosenAssignee],
        comments: 0,
        attachments: 0,
        labels: [],
        storyPoints: parseInt(taskStoryPoints) || 5
      };

      await setDoc(doc(db, 'tasks', taskId), taskData);

      // Update project task count
      const projRef = doc(db, 'projects', id);
      await updateDoc(projRef, {
        taskCount: (projectInfo?.taskCount || 0) + 1
      });

      // Log activity
      const activityId = `act-${Date.now()}`;
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        user: auth.currentUser?.displayName || 'User',
        action: 'created task',
        target: `${taskTitle} inside ${projectInfo?.name || 'Project'}`,
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
      setModalLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <Link href="/projects" className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20"
                style={{ background: projectInfo?.color || '#2563EB' }}
              >
                {projectInfo?.key || 'PR'}
              </div>
              <h1 className="text-xl font-bold text-white">{projectInfo?.name || 'Loading Project...'}</h1>
            </div>
            <p className="text-xs text-[#475569] mt-0.5 ml-10">
              Sprint 4 · {projectInfo?.taskCount || 0} tasks total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] w-48 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg hover:border-[rgba(255,255,255,0.15)] transition-all">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg hover:border-[rgba(255,255,255,0.15)] transition-all">
            <Users className="w-4 h-4" /> Members
          </button>
          <GradientButton onClick={() => setIsModalOpen(true)} size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Task
          </GradientButton>
        </div>
      </motion.div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-h-[500px] pb-4" style={{ minWidth: columnOrder.length * 310 }}>
            {columnOrder.map((colId) => (
              <KanbanColumn key={colId} colId={colId} column={columns[colId]} />
            ))}
          </div>
        </div>
      </DragDropContext>

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
              
              <h2 className="text-lg font-bold text-white mb-4">Add Task to {projectInfo?.name}</h2>
              
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
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Assignee</label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#0F172A] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    >
                      {projectMembers.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
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
                    disabled={modalLoading}
                    className="px-5 py-2 text-sm font-semibold text-white gradient-primary rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {modalLoading ? 'Adding...' : 'Add Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Column ───────────────────────────────────
function KanbanColumn({
  colId,
  column,
}: {
  colId: TaskStatus;
  column: { title: string; tasks: BoardTask[] };
}) {
  const config = statusColors[colId];
  const totalPoints = column.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: config.text }} />
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
          <span className="text-xs text-[#475569] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
          {totalPoints > 0 && (
            <span className="text-[10px] text-[#475569] font-mono">{totalPoints}pts</span>
          )}
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={colId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2.5 p-1.5 rounded-xl transition-colors min-h-[100px] ${
              snapshot.isDraggingOver ? 'bg-[rgba(37,99,235,0.05)] ring-1 ring-[rgba(37,99,235,0.15)]' : ''
            }`}
          >
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <TaskCard task={task} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ─── Task Card ────────────────────────────────
function TaskCard({ task, isDragging }: { task: BoardTask; isDragging: boolean }) {
  return (
    <motion.div
      layout
      className={`bg-[#0F172A] border border-[rgba(255,255,255,0.06)] rounded-xl p-3.5 cursor-pointer group transition-all hover:border-[rgba(37,99,235,0.25)] ${
        isDragging ? 'shadow-2xl shadow-blue-500/10 ring-1 ring-[#2563EB]/30 scale-[1.02] rotate-1' : ''
      }`}
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2.5">
          {task.labels.map((label) => (
            <span
              key={label.name}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-white leading-snug mb-2 group-hover:text-[#60A5FA] transition-colors">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-[#475569] mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Meta Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#475569] font-mono">{task.projectKey || 'TASK'}-{task.number}</span>
          <PriorityBadge priority={task.priority} />
        </div>
        {task.storyPoints && (
          <span className="text-[10px] text-[#475569] bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 rounded font-mono">
            {task.storyPoints}SP
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3 text-[#475569]">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3" /> {task.dueDate}
            </span>
          )}
          {task.comments > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3 h-3" /> {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <Paperclip className="w-3 h-3" /> {task.attachments}
            </span>
          )}
        </div>
        <AvatarGroup users={task.assignees || []} max={2} size="sm" />
      </div>
    </motion.div>
  );
}
