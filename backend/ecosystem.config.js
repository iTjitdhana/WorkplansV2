module.exports = {
  apps: [{
    name: 'esp-tracker-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3007
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3007
    }
  }]
} 