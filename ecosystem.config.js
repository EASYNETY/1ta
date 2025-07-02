// ecosystem.config.js - PM2 Configuration with Memory Management
module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1, // Single instance to control memory usage
      exec_mode: 'fork', // Fork mode for better memory isolation
      
      // Memory management
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      node_args: [
        '--max-old-space-size=1024', // 1GB heap limit
        '--max-semi-space-size=128',  // 128MB semi-space
        '--optimize-for-size',        // Optimize for memory usage
        '--gc-interval=100',          // More frequent garbage collection
        '--expose-gc'                 // Enable manual garbage collection
      ],
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Memory monitoring
        NODE_OPTIONS: '--max-old-space-size=1024 --expose-gc',
        // Disable source maps in production to save memory
        GENERATE_SOURCEMAP: 'false',
        // Reduce bundle analyzer memory usage
        ANALYZE: 'false'
      },
      
      // Development environment
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=2048 --expose-gc',
        GENERATE_SOURCEMAP: 'true'
      },
      
      // Logging
      log_file: './logs/app.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      autorestart: true,
      watch: false, // Disable watch in production
      max_restarts: 10,
      min_uptime: '10s',
      
      // Monitoring
      monitoring: false, // Disable PM2 monitoring to save memory
      
      // Advanced memory settings
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Custom restart conditions
      restart_delay: 4000,
      
      // Health check
      health_check_grace_period: 3000,
    }
  ],
  
  // Global PM2 settings
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
