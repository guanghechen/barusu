const moduleStylePlop = require('./module-style.plop')
const projectStylePlop = require('./project-style.plop')


module.exports = function (plop) {
  projectStylePlop(plop)
  moduleStylePlop(plop)
}
