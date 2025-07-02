#!/usr/bin/env node
// scripts/memory-monitor.js - Memory monitoring and cleanup script

const fs = require('fs');
const path = require('path');

class MemoryMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/memory.log');
    this.alertThreshold = 800; // MB
    this.criticalThreshold = 1000; // MB
    this.checkInterval = 30000; // 30 seconds
    this.isMonitoring = false;
    
    // Ensure logs directory exists
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024), // MB
      timestamp: new Date().toISOString()
    };
  }

  logMemoryUsage(usage, level = 'INFO') {
    const logEntry = {
      timestamp: usage.timestamp,
      level,
      memory: {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external,
        arrayBuffers: usage.arrayBuffers
      }
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Write to file
    fs.appendFileSync(this.logFile, logLine);
    
    // Also log to console
    console.log(`[${level}] Memory Usage - RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB, External: ${usage.external}MB, ArrayBuffers: ${usage.arrayBuffers}MB`);
  }

  forceGarbageCollection() {
    if (global.gc) {
      try {
        console.log('[MEMORY] Forcing garbage collection...');
        global.gc();
        console.log('[MEMORY] Garbage collection completed');
        return true;
      } catch (error) {
        console.error('[MEMORY] Failed to force garbage collection:', error.message);
        return false;
      }
    } else {
      console.warn('[MEMORY] Garbage collection not available. Start Node.js with --expose-gc flag.');
      return false;
    }
  }

  checkMemoryThresholds(usage) {
    if (usage.heapUsed >= this.criticalThreshold) {
      this.logMemoryUsage(usage, 'CRITICAL');
      console.error(`[CRITICAL] Memory usage is critical: ${usage.heapUsed}MB`);
      
      // Force garbage collection
      this.forceGarbageCollection();
      
      // Check again after GC
      const afterGC = this.getMemoryUsage();
      this.logMemoryUsage(afterGC, 'POST-GC');
      
      if (afterGC.heapUsed >= this.criticalThreshold) {
        console.error('[CRITICAL] Memory still high after GC. Consider restarting the application.');
        // You could trigger a graceful restart here
        // process.exit(1);
      }
      
    } else if (usage.heapUsed >= this.alertThreshold) {
      this.logMemoryUsage(usage, 'WARNING');
      console.warn(`[WARNING] Memory usage is high: ${usage.heapUsed}MB`);
      
      // Trigger garbage collection as preventive measure
      this.forceGarbageCollection();
    } else {
      this.logMemoryUsage(usage, 'INFO');
    }
  }

  start() {
    if (this.isMonitoring) {
      console.log('[MEMORY] Monitor is already running');
      return;
    }

    console.log(`[MEMORY] Starting memory monitor (checking every ${this.checkInterval/1000}s)`);
    console.log(`[MEMORY] Alert threshold: ${this.alertThreshold}MB, Critical threshold: ${this.criticalThreshold}MB`);
    
    this.isMonitoring = true;
    
    // Initial check
    const initialUsage = this.getMemoryUsage();
    this.checkMemoryThresholds(initialUsage);
    
    // Set up interval
    this.interval = setInterval(() => {
      if (!this.isMonitoring) return;
      
      const usage = this.getMemoryUsage();
      this.checkMemoryThresholds(usage);
    }, this.checkInterval);

    // Handle process termination
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  stop() {
    if (!this.isMonitoring) return;
    
    console.log('[MEMORY] Stopping memory monitor');
    this.isMonitoring = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // Generate memory report
  generateReport() {
    const usage = this.getMemoryUsage();
    const report = {
      timestamp: usage.timestamp,
      memory: usage,
      thresholds: {
        alert: this.alertThreshold,
        critical: this.criticalThreshold
      },
      status: usage.heapUsed >= this.criticalThreshold ? 'CRITICAL' :
              usage.heapUsed >= this.alertThreshold ? 'WARNING' : 'OK'
    };

    console.log('\n=== MEMORY REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('====================\n');

    return report;
  }

  // Clean old log files
  cleanOldLogs(daysToKeep = 7) {
    const logsDir = path.dirname(this.logFile);
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    try {
      const files = fs.readdirSync(logsDir);
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          console.log(`[MEMORY] Cleaned old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('[MEMORY] Error cleaning old logs:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new MemoryMonitor();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      monitor.start();
      break;
    case 'report':
      monitor.generateReport();
      break;
    case 'gc':
      monitor.forceGarbageCollection();
      break;
    case 'clean':
      const days = parseInt(process.argv[3]) || 7;
      monitor.cleanOldLogs(days);
      break;
    default:
      console.log('Usage: node memory-monitor.js [start|report|gc|clean]');
      console.log('  start  - Start continuous memory monitoring');
      console.log('  report - Generate current memory report');
      console.log('  gc     - Force garbage collection');
      console.log('  clean  - Clean old log files (default: 7 days)');
      process.exit(1);
  }
}

module.exports = MemoryMonitor;
