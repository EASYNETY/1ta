// lib/socket.ts
'use client'; // This ensures it's only run in the browser

import { io } from 'socket.io-client';

const socket = io('https://api.onetechacademy.com', {
  transports: ['websocket'], // optional for performance
});

export default socket;
