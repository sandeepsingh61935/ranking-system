


module.exports= {
    apps: [
      {
        name: 'backend',
        script: 'npm run start:prod',
        env: {
          NODE_ENV: 'production',
        },
        instances: 1,
        out_file: "output.log",
        error_file: "error.log"
      },
    ],
  };
  
  