'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, Search, Filter, Grid3X3, List, FileText, Image, Film, File, MoreHorizontal, Download, Eye, Trash2, FolderOpen, HardDrive } from 'lucide-react';
import { GlassCard, PageHeader, GradientButton } from '@/components/shared';

const files = [
  { id: '1', name: 'Design_System_v2.fig', type: 'design', size: '24.5 MB', uploadedBy: 'Karen White', uploadedAt: 'Jun 1, 2026', icon: '🎨', color: '#EC4899' },
  { id: '2', name: 'API_Documentation.pdf', type: 'pdf', size: '3.2 MB', uploadedBy: 'Mike Rodriguez', uploadedAt: 'May 28, 2026', icon: '📄', color: '#EF4444' },
  { id: '3', name: 'Sprint_Review_Slides.pptx', type: 'ppt', size: '8.7 MB', uploadedBy: 'Tom Chen', uploadedAt: 'May 30, 2026', icon: '📊', color: '#F59E0B' },
  { id: '4', name: 'User_Flow_Diagram.png', type: 'image', size: '1.8 MB', uploadedBy: 'Lisa Morgan', uploadedAt: 'Jun 2, 2026', icon: '🖼️', color: '#22C55E' },
  { id: '5', name: 'Database_Schema.sql', type: 'code', size: '42 KB', uploadedBy: 'John Davis', uploadedAt: 'Jun 3, 2026', icon: '💾', color: '#2563EB' },
  { id: '6', name: 'Product_Demo.mp4', type: 'video', size: '156 MB', uploadedBy: 'Amy Wilson', uploadedAt: 'May 25, 2026', icon: '🎬', color: '#A78BFA' },
  { id: '7', name: 'Requirements.docx', type: 'doc', size: '560 KB', uploadedBy: 'Sarah Kim', uploadedAt: 'May 20, 2026', icon: '📝', color: '#60A5FA' },
  { id: '8', name: 'Release_Notes.md', type: 'code', size: '12 KB', uploadedBy: 'Mike Rodriguez', uploadedAt: 'Jun 3, 2026', icon: '📋', color: '#14B8A6' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function FilesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Files"
        description="Manage project files and documents"
        actions={
          <GradientButton icon={<Upload className="w-4 h-4" />}>Upload File</GradientButton>
        }
      />

      {/* Storage Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center text-[#2563EB]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#64748B]">Storage Used</p>
            <p className="text-lg font-bold text-white">2.4 GB <span className="text-xs text-[#64748B] font-normal">/ 10 GB</span></p>
            <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full mt-1.5 overflow-hidden">
              <div className="h-full w-[24%] bg-[#2563EB] rounded-full" />
            </div>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center text-[#22C55E]">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Total Files</p>
            <p className="text-lg font-bold text-white">{files.length}</p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center text-[#F59E0B]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#64748B]">Uploaded This Week</p>
            <p className="text-lg font-bold text-white">12</p>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
          <input type="text" placeholder="Search files..." className="w-full pl-10 pr-4 py-2.5 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#475569] focus:outline-none focus:border-[#2563EB] transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#94A3B8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:border-[rgba(255,255,255,0.15)] transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <div className="flex bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-1">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]' : 'text-[#64748B]'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]' : 'text-[#64748B]'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </motion.div>

      {/* Files Grid */}
      {view === 'grid' ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <motion.div key={file.id} variants={itemVariants} className="card-premium p-4 group cursor-pointer">
              <div className="w-full h-28 rounded-xl bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-4 group-hover:bg-[rgba(255,255,255,0.04)] transition-all">
                <span className="text-4xl">{file.icon}</span>
              </div>
              <h4 className="text-sm font-medium text-white truncate group-hover:text-[#60A5FA] transition-colors">{file.name}</h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#475569]">{file.size}</span>
                <span className="text-xs text-[#475569]">{file.uploadedAt}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                <span className="text-xs text-[#64748B]">{file.uploadedBy}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-1 text-[#475569] hover:text-white rounded"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1 text-[#475569] hover:text-white rounded"><Download className="w-3.5 h-3.5" /></button>
                  <button className="p-1 text-[#475569] hover:text-[#EF4444] rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="glass rounded-xl overflow-hidden">
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {files.map((file) => (
              <motion.div key={file.id} variants={itemVariants} className="flex items-center gap-4 px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer">
                <span className="text-xl">{file.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-[#60A5FA] transition-colors">{file.name}</p>
                  <p className="text-xs text-[#475569]">{file.uploadedBy}</p>
                </div>
                <span className="text-xs text-[#475569] hidden md:block">{file.size}</span>
                <span className="text-xs text-[#475569] hidden lg:block">{file.uploadedAt}</span>
                <button className="p-1 text-[#475569] hover:text-white rounded"><MoreHorizontal className="w-4 h-4" /></button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
