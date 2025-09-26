// lib/socket.ts
'use client'; // This ensures it's only run in the browser

import { io } from 'socket.io-client';

// Use WebSocket URL from environment, fallback to API URL
const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
              (process.env.NEXT_PUBLIC_API_BASE_URL ?
               process.env.NEXT_PUBLIC_API_BASE_URL.replace(/^https?/, 'wss').replace('/api', '') :
               'wss://api.onetechacademy.com');

console.log('🔌 Global socket connecting to:', wsUrl);

const socket = io(wsUrl, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : undefined
  }
});

export default socket;
