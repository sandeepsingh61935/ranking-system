
// import the AppConfig interface

// export the configuration object
export default {
  // apps is an array of AppConfig objects
  apps: [
    {
      // name is the application name
      name: 'frontend',
      // script is the script path relative to pm2 start
      script: 'serve',
      // interpreter is the interpreter absolute path (default to node)
      interpreter: '/home/sandy/.nvm/versions/node/v16.20.0/bin/ts-node',
      // env is an object that contains environment variables for all environments
      node_args: '-r ts-node/register -r tsconfig-paths/register',
      env: {
        NODE_ENV: 'development',
        "TS_NODE_BASEURL" : "./dist/",
        PORT: 3000,
      },
      out_file: "output.log",
      error_file: "error.log",
      // env_production is an object that contains environment variables for production environment
      env_production: {
        NODE_ENV: 'production',
      },
      // instances is the number of app instance to be launched (default to 1)
      instances: 1,
      // exec_mode is the mode to start your app, can be "cluster" or "fork" (default to fork)
      exec_mode: 'fork',
    },
  ],
//   // deploy is an object that contains the deployment configuration for your applications
//   deploy: {
//     // production is an object that contains the deployment configuration for production environment
//     production: {
//       // user is the username for the remote server
//       user: 'root',
//       // host is the hostname or IP address of the remote server
//       host: 'example.com',
//       // ref is the git branch or commit hash to deploy
//       ref: 'origin/master',
//       // repo is the git repository URL
//       repo: 'git@example.com:repo.git',
//       // path is the path on the remote server where the project will be deployed
//       path: '/var/www/my-app',
//       // post-deploy is a command or a series of commands to execute on the remote server after the deployment
//       post-deploy:
//         'yarn install && pm2 reload ecosystem.config.ts --env production',
//     },
//   },
};

