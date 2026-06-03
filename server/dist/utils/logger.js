"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const formatTime = () => {
    return new Date().toISOString();
};
exports.logger = {
    info: (message, ...args) => {
        console.log(`[${formatTime()}] [INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[${formatTime()}] [WARN] ⚠️ ${message}`, ...args);
    },
    error: (message, error, ...args) => {
        console.error(`[${formatTime()}] [ERROR] ❌ ${message}`, error ?? '', ...args);
    },
    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[${formatTime()}] [DEBUG] 🔧 ${message}`, ...args);
        }
    },
};
