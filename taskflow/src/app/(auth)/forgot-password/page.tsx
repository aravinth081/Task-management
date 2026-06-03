'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Mail, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="auth-bg flex items-center justify-center p-4 min-h-screen">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] rounded-full animate-float pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(37,99,235,0.1)] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#2563EB]" />
            </div>
            <h2 className="text-xl font-bold text-white">Reset your password</h2>
            <p className="text-sm text-[#64748B] mt-1">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#94A3B8] mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input type="email" placeholder="name@company.com" className="w-full pl-11 pr-4 py-3 text-sm bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder:text-[#334155] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all" />
              </div>
            </div>

            <button type="button" className="w-full py-3 text-sm font-semibold text-white gradient-primary rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2">
              Send Reset Link <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-[#94A3B8] hover:text-white mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
