


module.exports= {
    apps: [
      {
        name: 'backend',
        script: 'npm',
        args: " run start:prod",
        env: {
          NODE_ENV: 'production',
        },
        out_file: "output.log",
        error_file: "error.log",
        log_file: "app.log",
        time: true
      },
    ],
  };
  
  