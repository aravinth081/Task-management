'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Search, Plus, Send, Smile, Paperclip, Phone, Video, MoreVertical,
  Hash, Users, MessageSquare, Circle, ChevronDown, Settings,
} from 'lucide-react';

const channels = [
  { id: '1', name: 'general', type: 'channel', unread: 3 },
  { id: '2', name: 'engineering', type: 'channel', unread: 0 },
  { id: '3', name: 'design', type: 'channel', unread: 7 },
  { id: '4', name: 'announcements', type: 'channel', unread: 1 },
];

const directMessages = [
  { id: '1', name: 'Sarah Kim', status: 'online', lastMessage: 'Sure, I\'ll review the PR now', unread: 2 },
  { id: '2', name: 'Mike Rodriguez', status: 'online', lastMessage: 'The API is ready for testing', unread: 0 },
  { id: '3', name: 'Lisa Morgan', status: 'away', lastMessage: 'Can we schedule a design review?', unread: 0 },
  { id: '4', name: 'John Davis', status: 'offline', lastMessage: 'Merged the migration branch', unread: 0 },
];

const messages = [
  { id: '1', user: 'Sarah Kim', content: 'Hey team! Just pushed the new authentication module. Can someone review the PR? 🚀', time: '10:24 AM', reactions: [{ emoji: '🔥', count: 3 }, { emoji: '👍', count: 2 }] },
  { id: '2', user: 'Mike Rodriguez', content: 'On it! I\'ll check the API integration parts. Does it include the refresh token flow?', time: '10:28 AM', reactions: [] },
  { id: '3', user: 'Sarah Kim', content: 'Yes, full JWT + refresh token flow with secure cookie storage. Also added rate limiting on the auth endpoints.', time: '10:30 AM', reactions: [{ emoji: '💯', count: 4 }] },
  { id: '4', user: 'Lisa Morgan', content: 'Nice work Sarah! I\'ve updated the login page designs to match the new flow. Here\'s the Figma link:\nhttps://figma.com/design/auth-flow-v2', time: '10:35 AM', reactions: [{ emoji: '❤️', count: 2 }] },
  { id: '5', user: 'John Davis', content: '@Mike Rodriguez I noticed we should add CSRF protection too. Want me to handle that in a separate PR?', time: '10:42 AM', reactions: [] },
  { id: '6', user: 'Mike Rodriguez', content: 'Good catch John! Yes, let\'s keep it in a separate PR for cleaner review. I\'ll create the ticket.', time: '10:45 AM', reactions: [{ emoji: '👍', count: 1 }] },
  { id: '7', user: 'Amy Wilson', content: 'Team standup reminder in 15 minutes! Please update your task status before the call. 📋', time: '10:50 AM', reactions: [{ emoji: '✅', count: 5 }] },
];

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageInput, setMessageInput] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-7rem)] flex glass rounded-2xl overflow-hidden"
    >
      {/* Sidebar */}
      <div className="w-64 border-r border-[rgba(255,255,255,0.06)] flex-shrink-0 flex flex-col hidden md:flex">
        {/* Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Messages</h2>
            <button className="p-1.5 text-[#475569] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] transition-all"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto py-3">
          <div className="px-3 mb-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">Channels</span>
              <button className="p-0.5 text-[#475569] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                  activeChannel === ch.name
                    ? 'bg-[rgba(37,99,235,0.15)] text-white'
                    : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#475569]" />
                  {ch.name}
                </span>
                {ch.unread > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#2563EB] text-white rounded-full min-w-[18px] text-center">
                    {ch.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider">Direct Messages</span>
              <button className="p-0.5 text-[#475569] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            {directMessages.map((dm) => (
              <button
                key={dm.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)] hover:text-white transition-all mb-0.5"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold"
                    style={{ background: `hsl(${dm.name.charCodeAt(0) * 7 % 360}, 60%, 45%)` }}>
                    {dm.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <Circle
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${
                      dm.status === 'online' ? 'text-[#22C55E] fill-[#22C55E]' :
                      dm.status === 'away' ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#475569] fill-[#475569]'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-white truncate">{dm.name}</p>
                  <p className="text-[10px] text-[#475569] truncate">{dm.lastMessage}</p>
                </div>
                {dm.unread > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#2563EB] text-white rounded-full">
                    {dm.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-[#475569]" />
            <div>
              <h3 className="text-sm font-semibold text-white">{activeChannel}</h3>
              <p className="text-[11px] text-[#475569]">12 members · 3 online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all">
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 group hover:bg-[rgba(255,255,255,0.01)] -mx-3 px-3 py-1.5 rounded-xl transition-colors"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
                style={{ background: `hsl(${msg.user.charCodeAt(0) * 7 % 360}, 60%, 45%)` }}
              >
                {msg.user.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white">{msg.user}</span>
                  <span className="text-[10px] text-[#475569]">{msg.time}</span>
                </div>
                <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {msg.reactions.map((r, ri) => (
                      <span key={ri} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full cursor-pointer hover:border-[rgba(37,99,235,0.3)] transition-colors">
                        {r.emoji} <span className="text-[#94A3B8]">{r.count}</span>
                      </span>
                    ))}
                    <button className="p-1 text-[#475569] hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all">
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Message #${activeChannel}`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] transition-all pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-1.5 text-[#475569] hover:text-white rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-[#475569] hover:text-white rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button className="p-3 gradient-primary rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
