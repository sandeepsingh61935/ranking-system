

module.exports= {
  apps: [
    {
      name: 'backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      instances: 1,
      out_file: "output.log",
      error_file: "error.log"
    },
  ],
};

