import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

const projectRoot = process.cwd()

async function cleanup() {
	console.log(chalk.yellow('🧹 Starting project cleanup...'))

	const pathsToRemove = '__PATHS_TO_REMOVE__'

	for (const p of pathsToRemove) {
		try {
			await fs.remove(path.join(projectRoot, p))
			console.log(chalk.gray(`  - Removed: ${p}`))
		} catch (err) {
			console.error(chalk.red(`Error removing ${p}:`, err))
		}
	}

	const packageJsonPath = path.join(projectRoot, 'package.json')
	try {
		const packageJson = await fs.readJson(packageJsonPath)
		delete packageJson.scripts.cleanup
		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
		console.log(chalk.gray('  - Removed "cleanup" script from package.json'))
	} catch (err) {
		console.error(chalk.red('Error updating package.json:', err))
	}

	await fs.remove(path.join(projectRoot, 'scripts'))
	console.log(chalk.gray('  - Removed: scripts/ folder'))
	await fs.remove(path.join(projectRoot, 'docs'))
	console.log(chalk.gray('  - Removed: docs/ folder'))

	console.log(chalk.green('\n✅ Cleanup complete! Your project is ready.'))
}

cleanup()
