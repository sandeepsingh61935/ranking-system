module.exports = {
  "apps": [
    {
      "name": "frontend",
      "script": "serve",
      "env": {
        "PM2_SERVE_PATH": "dist",
        "PM2_SERVE_PORT": 3000,
        "PM2_SERVE_SPA": "true",
        "PM2_SERVE_HOMEPAGE": "/index.html"
      },
      "out_file": "output.log",
      "error_file": "error.log",
    }
  ]
};