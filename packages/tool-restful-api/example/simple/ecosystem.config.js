const path = require('path')
const manifest = require('./package.json')


const name = manifest.name
module.exports = {
  apps: {
    name,
    cwd: path.resolve(),
    script: 'yarn',
    args: 'serve',
    env: {
      NODE_ENV: 'development'
    },
    error_file: `./logs/${ name }-err.log`,
    out_file: `./logs/${ name }-out.log`,
    merge_logs: true,
    autorestart: true,
  }
}
