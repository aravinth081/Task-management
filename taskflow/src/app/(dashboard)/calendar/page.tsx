'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Users } from 'lucide-react';
import { GlassCard, PriorityBadge } from '@/components/shared';
import { Priority } from '@/types';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarEvent {
  id: string;
  title: string;
  date: number;
  time?: string;
  priority: Priority;
  color: string;
  project?: string;
}

const events: CalendarEvent[] = [
  { id: '1', title: 'Sprint Planning', date: 3, time: '10:00 AM', priority: Priority.HIGH, color: '#2563EB', project: 'E-Commerce' },
  { id: '2', title: 'API Review', date: 5, time: '2:00 PM', priority: Priority.MEDIUM, color: '#22C55E', project: 'API Gateway' },
  { id: '3', title: 'Design Handoff', date: 5, priority: Priority.LOW, color: '#A78BFA', project: 'Mobile App' },
  { id: '4', title: 'Payment Integration Due', date: 8, priority: Priority.CRITICAL, color: '#EF4444', project: 'E-Commerce' },
  { id: '5', title: 'Team Standup', date: 10, time: '9:30 AM', priority: Priority.LOW, color: '#60A5FA' },
  { id: '6', title: 'Database Migration', date: 12, time: '11:00 AM', priority: Priority.HIGH, color: '#F59E0B', project: 'Data Pipeline' },
  { id: '7', title: 'Sprint Retrospective', date: 14, time: '3:00 PM', priority: Priority.MEDIUM, color: '#2563EB' },
  { id: '8', title: 'Release v2.1', date: 18, priority: Priority.CRITICAL, color: '#22C55E', project: 'E-Commerce' },
  { id: '9', title: 'UX Testing Session', date: 20, time: '1:00 PM', priority: Priority.MEDIUM, color: '#EC4899', project: 'Mobile App' },
  { id: '10', title: 'Quarterly Review', date: 25, time: '10:00 AM', priority: Priority.HIGH, color: '#2563EB' },
  { id: '11', title: 'Deployment Window', date: 28, time: '6:00 AM', priority: Priority.CRITICAL, color: '#EF4444' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.02 } } };
const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } };

export default function CalendarPage() {
  const [currentDate] = useState(new Date(2026, 5, 1)); // June 2026
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<number | null>(3);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = 3;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const selectedEvents = events.filter((e) => e.date === selectedDate);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Schedule and track your tasks and events</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-1">
            {['month', 'week'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'month' | 'week')}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  view === v ? 'bg-[rgba(37,99,235,0.15)] text-[#2563EB]' : 'text-[#64748B] hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-white gradient-primary rounded-xl shadow-lg shadow-blue-500/25 transition-all">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <GlassCard hover={false}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 text-xs font-medium text-[#2563EB] bg-[rgba(37,99,235,0.1)] rounded-lg">
                  Today
                </button>
                <button className="p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-[#475569] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden">
              {calendarDays.map((day, index) => {
                const dayEvents = day ? events.filter((e) => e.date === day) : [];
                const isToday = day === today;
                const isSelected = day === selectedDate;

                return (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    className={`min-h-[100px] p-2 bg-[#0B1120] cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.03)] ${
                      !day ? 'bg-[#050816] cursor-default' : ''
                    } ${isSelected ? 'ring-1 ring-[#2563EB] ring-inset bg-[rgba(37,99,235,0.05)]' : ''}`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-lg mb-1 ${
                          isToday ? 'bg-[#2563EB] text-white' : 'text-[#94A3B8]'
                        }`}>
                          {day}
                        </span>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium"
                              style={{ background: `${event.color}20`, color: event.color }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-[#475569]">+{dayEvents.length - 2} more</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sidebar — Selected Day Events */}
        <motion.div variants={itemVariants}>
          <GlassCard hover={false} className="sticky top-24">
            <h3 className="text-base font-semibold text-white mb-1">
              {selectedDate ? `June ${selectedDate}, 2026` : 'Select a date'}
            </h3>
            <p className="text-xs text-[#475569] mb-4">
              {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} scheduled
            </p>

            {selectedEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-[#475569]" />
                </div>
                <p className="text-sm text-[#475569]">No events on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0" style={{ background: event.color }} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white group-hover:text-[#60A5FA] transition-colors">
                          {event.title}
                        </h4>
                        {event.time && (
                          <p className="text-xs text-[#475569] mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {event.time}
                          </p>
                        )}
                        {event.project && (
                          <p className="text-xs text-[#64748B] mt-1">{event.project}</p>
                        )}
                        <div className="mt-2">
                          <PriorityBadge priority={event.priority} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
