'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  return (
    <div className="auth-bg flex items-center justify-center p-4 min-h-screen">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[radial-gradient(circle,rgba(34,197,94,0.06)_0%,transparent_70%)] rounded-full animate-float pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#22C55E]" />
            </div>
            <h2 className="text-xl font-bold text-white">Verify your email</h2>
            <p className="text-sm text-[#64748B] mt-1">We&apos;ve sent a 6-digit code to<br /><span className="text-white font-medium">admin@taskflow.io</span></p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            ))}
          </div>

          <button type="button" className="w-full py-3 text-sm font-semibold text-white gradient-primary rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2">
            Verify Code <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-sm text-[#475569] mt-4">
            Didn&apos;t receive the code?{' '}
            <button className="text-[#2563EB] hover:text-[#60A5FA] font-medium transition-colors">Resend</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
