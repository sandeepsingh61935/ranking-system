module.exports = {
    apps: [
        {
            name: 'backend',
            script: './server/dist/main.js',
            env: {
                NODE_ENV: 'production',
            },
            instances: 1,
            out_file: "output.log",
            error_file: "error.log"
        },
        {
            name: 'frontend',
            script: 'serve',
            env: {
                PM2_SERVE_PATH: './client/dist',
                PM2_SERVE_PORT: 3000,
                PM2_SERVE_SPA: 'true',
                PM2_SERVE_HOMEPAGE: '/index.html',
                NODE_ENV: "production"
            },
            out_file: "output.log",
            error_file: "error.log"
        },
        {
            name: "redis",
            script: "redis-server",
        },
    ],
};
