const formatTime = () => {
  return new Date().toISOString();
};

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[${formatTime()}] [INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[${formatTime()}] [WARN] ⚠️ ${message}`, ...args);
  },
  error: (message: string, error?: unknown, ...args: unknown[]) => {
    console.error(`[${formatTime()}] [ERROR] ❌ ${message}`, error ?? '', ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${formatTime()}] [DEBUG] 🔧 ${message}`, ...args);
    }
  },
};
