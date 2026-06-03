'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Bot, User, Lightbulb, FileText, Clock, Target,
  Zap, Brain, Wand2, Copy, CheckCircle2, AlertTriangle,
  X, Loader2, Check
} from 'lucide-react';
import { GlassCard } from '@/components/shared';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

const suggestions = [
  { icon: '🚀', title: 'Generate Project Plan', description: 'Create tasks and timeline from a project description', prompt: 'Build an e-commerce website with user auth, product catalog, cart, and checkout' },
  { icon: '📊', title: 'Weekly Status Report', description: 'Generate a comprehensive weekly progress report', prompt: 'Generate a weekly status report for the Engineering team' },
  { icon: '🎯', title: 'Sprint Planning', description: 'Suggest optimal sprint goals and task allocation', prompt: 'Plan the next 2-week sprint for the Mobile App project' },
  { icon: '⚠️', title: 'Risk Assessment', description: 'Identify project risks and suggest mitigations', prompt: 'Analyze risks for the E-Commerce Platform project' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialChatHistory: Message[] = [
  {
    role: 'assistant',
    content: `Hello! I am **TaskFlow AI**, your intelligent project assistant. 

How can I help you plan or manage your tasks today? Here are some quick actions you can try:
- **Generate a Project Plan** for your new application.
- Outline tasks for your upcoming **Sprint Planning**.
- Analyze project risks and compile a **Risk Assessment**.

Select an action on the right, or type a custom query below to get started!`,
  }
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// Helpers for manual markdown-like parsing
const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] text-xs text-[#E2E8F0] font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const renderFormattedContent = (content: string) => {
  return content.split('\n').map((line, li) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return <h1 key={li} className="text-xl font-bold text-white mt-4 mb-2">{renderInlineStyles(trimmed.replace('# ', ''))}</h1>;
    }
    if (trimmed.startsWith('## ')) {
      return <h2 key={li} className="text-lg font-bold text-white mt-4 mb-2">{renderInlineStyles(trimmed.replace('## ', ''))}</h2>;
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={li} className="text-sm font-semibold text-[#60A5FA] mt-3 mb-1">{renderInlineStyles(trimmed.replace('### ', ''))}</h3>;
    }
    if (trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]')) {
      return (
        <p key={li} className="text-sm text-[#22C55E] flex items-start gap-2 ml-2 py-0.5">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-through opacity-60">{renderInlineStyles(trimmed.replace(/^-\s*\[[xX]\]\s*/, ''))}</span>
        </p>
      );
    }
    if (trimmed.startsWith('- [ ]')) {
      return (
        <p key={li} className="text-sm text-[#94A3B8] flex items-start gap-2 ml-2 py-0.5">
          <span className="w-4 h-4 rounded border border-[rgba(255,255,255,0.2)] mt-0.5 flex-shrink-0" />
          <span>{renderInlineStyles(trimmed.replace(/^-\s*\[\s*\]\s*/, ''))}</span>
        </p>
      );
    }
    if (trimmed.startsWith('- ')) {
      return (
        <p key={li} className="text-sm text-[#CBD5E1] flex items-start gap-2 ml-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] mt-2 flex-shrink-0" />
          <span>{renderInlineStyles(trimmed.replace(/^-\s*/, ''))}</span>
        </p>
      );
    }
    if (trimmed.startsWith('---')) {
      return <hr key={li} className="border-[rgba(255,255,255,0.06)] my-3" />;
    }
    if (trimmed === '') {
      return <br key={li} />;
    }
    return <p key={li} className="text-sm text-[#CBD5E1] leading-relaxed">{renderInlineStyles(line)}</p>;
  });
};

const extractTasks = (text: string): string[] => {
  const lines = text.split('\n');
  const tasksList: string[] = [];
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]')) {
      const taskName = trimmed.replace(/^-\s*\[[ xX]\]\s*/, '').trim();
      if (taskName) tasksList.push(taskName);
    } else if (trimmed.startsWith('- ') && !trimmed.startsWith('- [')) {
      const taskName = trimmed.replace(/^-\s*/, '').trim();
      if (taskName && taskName.length > 3 && !taskName.includes('**') && !taskName.endsWith(':')) {
        tasksList.push(taskName);
      }
    } else if (trimmed.match(/^\d+\.\s+/)) {
      const taskName = trimmed.replace(/^\d+\.\s+/, '').trim();
      if (taskName && taskName.length > 3 && !taskName.includes('**') && !taskName.endsWith(':')) {
        tasksList.push(taskName);
      }
    }
  });
  return tasksList;
};

export default function AIPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialChatHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Real-time Database Projects
  const [projects, setProjects] = useState<any[]>([]);

  // Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<{ title: string; checked: boolean }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [defaultStatus, setDefaultStatus] = useState('TODO');
  const [defaultPriority, setDefaultPriority] = useState('MEDIUM');
  const [defaultStoryPoints, setDefaultStoryPoints] = useState('5');
  const [manualTaskText, setManualTaskText] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen to projects in real-time
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: promptText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your env settings.');
      }

      // Map chat history to Gemini structure
      const contents = newMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{
                text: `You are TaskFlow AI, a premium Project Management Assistant. Help the user plan projects, outline tasks, assess risks, and estimate timelines.
                Format tasks clearly as list items starting with '- [ ] ' so they can be parsed and imported directly into the user's workspace.
                Keep your tone professional, structured, and clear.`
              }]
            }
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Could not retrieve response text from the model.');
      }

      setMessages([...newMessages, { role: 'assistant' as const, content: responseText }]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant' as const,
          content: `⚠️ **Error communicating with Gemini API:**\n\n${err.message || 'Please verify your API key and connection.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const openImportModal = (messageContent: string) => {
    const extracted = extractTasks(messageContent);
    setParsedTasks(extracted.map(t => ({ title: t, checked: true })));
    if (projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
    setIsImportModalOpen(true);
  };

  const toggleParsedTask = (index: number) => {
    setParsedTasks(prev =>
      prev.map((t, idx) => (idx === index ? { ...t, checked: !t.checked } : t))
    );
  };

  const addManualTask = () => {
    if (!manualTaskText.trim()) return;
    setParsedTasks(prev => [...prev, { title: manualTaskText.trim(), checked: true }]);
    setManualTaskText('');
  };

  const importTasksToFirebase = async () => {
    const tasksToCreate = parsedTasks.filter(t => t.checked);
    if (tasksToCreate.length === 0 || !selectedProjectId) return;

    setImportLoading(true);
    try {
      const projectObj = projects.find(p => p.id === selectedProjectId);
      const userDisplayName = auth.currentUser?.displayName || 'User';

      for (const [idx, task] of tasksToCreate.entries()) {
        const taskId = `task-${Date.now()}-${idx}`;
        const number = 100 + Math.floor(Math.random() * 900);

        const taskData = {
          id: taskId,
          number,
          projectId: selectedProjectId,
          title: task.title,
          description: 'Generated by TaskFlow AI',
          status: defaultStatus,
          priority: defaultPriority,
          project: projectObj?.name || 'Project',
          projectKey: projectObj?.key || 'PRJ',
          dueDate: 'Jun 30',
          assignees: [{ id: 'current-user', name: userDisplayName }],
          comments: 0,
          attachments: 0,
          labels: [{ name: 'AI', color: '#A78BFA' }],
          storyPoints: parseInt(defaultStoryPoints) || 5
        };

        await setDoc(doc(db, 'tasks', taskId), taskData);
      }

      // Update project task count
      if (projectObj) {
        const projRef = doc(db, 'projects', selectedProjectId);
        await updateDoc(projRef, {
          taskCount: (projectObj.taskCount || 0) + tasksToCreate.length
        });
      }

      // Log activity
      const activityId = `act-${Date.now()}`;
      await setDoc(doc(db, 'activities', activityId), {
        id: activityId,
        user: userDisplayName,
        action: 'imported tasks via AI',
        target: `${tasksToCreate.length} tasks into ${projectObj?.name || 'Project'}`,
        time: new Date().toISOString(),
        type: 'success'
      });

      setIsImportModalOpen(false);
      setParsedTasks([]);
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant' as const,
          content: `✅ Successfully imported **${tasksToCreate.length} tasks** into project **${projectObj?.name}**!`
        }
      ]);
    } catch (err) {
      console.error('Error importing tasks:', err);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#2563EB] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
              <p className="text-sm text-[#94A3B8]">Powered by Gemini AI — Generate plans, import tasks, and optimize your sprint</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#22C55E] bg-[rgba(34,197,94,0.1)] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            Online
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <GlassCard hover={false} className="flex flex-col h-[calc(100vh-14rem)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-[#A78BFA] to-[#2563EB]'
                      : 'bg-[#1E293B]'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {msg.role === 'assistant' ? 'TaskFlow AI' : 'You'}
                      </span>
                    </div>
                    <div className={`text-sm leading-relaxed ${
                      msg.role === 'assistant' ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none space-y-2">
                          {renderFormattedContent(msg.content)}
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleCopy(msg.content, i)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg hover:border-[rgba(255,255,255,0.15)] transition-all flex-shrink-0"
                        >
                          {copiedIndex === i ? (
                            <>
                              <Check className="w-3 h-3 text-[#22C55E]" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openImportModal(msg.content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#2563EB] bg-[rgba(37,99,235,0.1)] rounded-lg hover:bg-[rgba(37,99,235,0.15)] transition-all flex-shrink-0"
                        >
                          <Zap className="w-3 h-3" /> Create Tasks
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#A78BFA] to-[#2563EB]">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">TaskFlow AI</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]"
            >
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={isLoading ? "AI is thinking..." : "Describe your project or ask AI for help..."}
                  className="w-full px-4 py-3.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] pr-12 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 gradient-primary rounded-lg shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-[#475569] mt-2 text-center">
                AI can make mistakes. Review generated content before creating tasks.
              </p>
            </form>
          </GlassCard>
        </motion.div>

        {/* Suggestions Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
            Quick Actions
          </h3>
          {suggestions.map((s) => (
            <button
              key={s.title}
              onClick={() => {
                setInput(s.prompt);
                handleSend(s.prompt);
              }}
              disabled={isLoading}
              className="w-full text-left card-premium p-4 group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-white group-hover:text-[#60A5FA] transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-xs text-[#475569] mt-0.5">{s.description}</p>
                </div>
              </div>
            </button>
          ))}

          {/* AI Capabilities */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#A78BFA]" />
              Capabilities
            </h3>
            <div className="space-y-2">
              {[
                { icon: FileText, text: 'Generate project plans' },
                { icon: Target, text: 'Smart deadline suggestions' },
                { icon: AlertTriangle, text: 'Risk detection & analysis' },
                { icon: Wand2, text: 'Auto-create task breakdowns' },
                { icon: Clock, text: 'Effort estimation' },
              ].map((cap) => (
                <div key={cap.text} className="flex items-center gap-2 text-xs text-[#64748B]">
                  <cap.icon className="w-3.5 h-3.5 text-[#475569]" />
                  {cap.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Import Tasks Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl glass-strong rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#A78BFA]" />
                  Import Tasks to Project
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Select which tasks you'd like to import and map them to your project in real-time.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {/* Project Selection */}
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Select Destination Project</label>
                  {projects.length > 0 ? (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0F172A] text-white">
                          {p.name} ({p.key})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-[#EF4444] bg-[rgba(239,68,68,0.1)] p-3 rounded-xl border border-[rgba(239,68,68,0.2)]">
                      No projects found. Please create a project first before importing tasks.
                    </div>
                  )}
                </div>

                {/* Task Configuration (default priority/story points/status) */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Default Status</label>
                    <select
                      value={defaultStatus}
                      onChange={(e) => setDefaultStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    >
                      <option value="BACKLOG" className="bg-[#0F172A]">Backlog</option>
                      <option value="TODO" className="bg-[#0F172A]">To Do</option>
                      <option value="IN_PROGRESS" className="bg-[#0F172A]">In Progress</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Default Priority</label>
                    <select
                      value={defaultPriority}
                      onChange={(e) => setDefaultPriority(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    >
                      <option value="LOW" className="bg-[#0F172A]">Low</option>
                      <option value="MEDIUM" className="bg-[#0F172A]">Medium</option>
                      <option value="HIGH" className="bg-[#0F172A]">High</option>
                      <option value="CRITICAL" className="bg-[#0F172A]">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Story Points</label>
                    <select
                      value={defaultStoryPoints}
                      onChange={(e) => setDefaultStoryPoints(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[rgba(15,23,42,0.6)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white focus:outline-none focus:border-[#2563EB] transition-all"
                    >
                      <option value="1" className="bg-[#0F172A]">1 pt</option>
                      <option value="2" className="bg-[#0F172A]">2 pts</option>
                      <option value="3" className="bg-[#0F172A]">3 pts</option>
                      <option value="5" className="bg-[#0F172A]">5 pts</option>
                      <option value="8" className="bg-[#0F172A]">8 pts</option>
                      <option value="13" className="bg-[#0F172A]">13 pts</option>
                    </select>
                  </div>
                </div>

                {/* Tasks List */}
                <div>
                  <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">
                    Tasks ({parsedTasks.filter(t => t.checked).length} selected)
                  </label>
                  {parsedTasks.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-[rgba(255,255,255,0.06)] rounded-xl p-3 bg-[rgba(15,23,42,0.4)]">
                      {parsedTasks.map((task, idx) => (
                        <label key={idx} className="flex items-start gap-2.5 py-1 px-1.5 hover:bg-[rgba(255,255,255,0.02)] rounded cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={task.checked}
                            onChange={() => toggleParsedTask(idx)}
                            className="mt-0.5 rounded border-[rgba(255,255,255,0.15)] text-[#2563EB] focus:ring-0 focus:ring-offset-0 bg-transparent"
                          />
                          <span className="text-xs text-[#CBD5E1] font-medium leading-tight">
                            {task.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#64748B] italic bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)] text-center">
                      No tasks parsed. You can type tasks manually below:
                    </div>
                  )}
                </div>

                {/* Manual Add Task */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualTaskText}
                    onChange={(e) => setManualTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addManualTask();
                      }
                    }}
                    placeholder="Add task title manually..."
                    className="flex-1 px-3 py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] transition-all"
                  />
                  <button
                    type="button"
                    onClick={addManualTask}
                    className="px-3 py-2 text-xs font-semibold text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-white bg-transparent rounded-xl border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.02)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={importTasksToFirebase}
                  disabled={importLoading || !selectedProjectId || parsedTasks.filter(t => t.checked).length === 0}
                  className="px-5 py-2 text-xs font-semibold text-white gradient-primary rounded-xl shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  {importLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Import {parsedTasks.filter(t => t.checked).length} Tasks
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
