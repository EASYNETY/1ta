// Simple test to verify the hook is exported correctly
const hook = require('./hooks/use-external-scanner-socket');

console.log('Hook exports:', Object.keys(hook));
console.log('Default export type:', typeof hook.default);
console.log('Named export type:', typeof hook.useExternalScannerSocket);
