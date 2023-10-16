module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      out_file: "output.log",
      error_file: "error.log"
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
      'post-deploy' : 'npm install && pm2 reload prod.ecosystem.config.cjs --env .env',
      'pre-setup': ''
    }
  }
};
