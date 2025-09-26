// lib/socket.ts
'use client'; // This ensures it's only run in the browser

import { io } from 'socket.io-client';

// Helper to normalize a provided websocket URL and ensure it has a protocol
function normalizeWsUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  let url = raw.trim();

  // If someone accidentally provided an http(s) URL, convert to ws(s)
  if (url.startsWith('http://')) url = url.replace(/^http:\/\//, 'ws://');
  if (url.startsWith('https://')) url = url.replace(/^https:\/\//, 'wss://');

  // If no protocol provided, prefix based on current page protocol
  if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss://' : 'ws://';
    // strip any leading slashes
    url = url.replace(/^\/+/, '');
    url = protocol + url;
  }

  // Remove accidental triple slashes like ws:///host
  url = url.replace(/ws:\/\/(\/+)/, 'ws://');
  url = url.replace(/wss:\/\/(\/+)/, 'wss://');

  return url;
}

// Derive websocket URL: explicit env var preferred, otherwise derive from API base URL
let rawWs = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
if (!rawWs && process.env.NEXT_PUBLIC_API_BASE_URL) {
  // Remove trailing /api and pass host:port to ws
  rawWs = process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, '');
}

const wsUrl = normalizeWsUrl(rawWs) || 'wss://api.onetechacademy.com';

console.log('🔌 Global socket connecting to:', wsUrl);

const socket = io(wsUrl, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  timeout: 5000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;
