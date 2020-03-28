import path from 'path'
import { PackageManager } from './index'


let packageJsonPath = process.argv[2] || 'package.json'
if (!packageJsonPath.endsWith('package.json')) {
  packageJsonPath = path.join(packageJsonPath, 'package.json')
}

console.log('packageJsonPath:', packageJsonPath)
const rootPackageJsonPath = path.resolve(packageJsonPath)
const manager = new PackageManager
manager.resolve(rootPackageJsonPath)
