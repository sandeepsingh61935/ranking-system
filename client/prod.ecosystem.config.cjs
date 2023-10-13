module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'vite',
      args: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ],
  deploy : {
    production : {
      user : 'ubuntu',
      host : '172.31.84.100',
      ref  : 'origin/master',
      repo : 'git@github.com:sandeepsingh61935/ranking-system.git',
      path : './dist',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env .env',
      'pre-setup': ''
    }
  }
};
