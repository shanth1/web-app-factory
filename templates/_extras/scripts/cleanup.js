import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

const projectRoot = process.cwd()

async function cleanup() {
	console.log(chalk.yellow('🧹 Starting project cleanup...'))

	const pathsToRemove = [
		'src/2-features',
		'src/3-widgets',
		'src/4-pages/about',
		'src/4-pages/home',
	]

	for (const p of pathsToRemove) {
		try {
			await fs.remove(path.join(projectRoot, p))
			console.log(chalk.gray(`  - Removed: ${p}`))
		} catch (err) {
			console.error(chalk.red(`Error removing ${p}:`, err))
		}
	}

	// Очистка package.json
	const packageJsonPath = path.join(projectRoot, 'package.json')
	try {
		const packageJson = await fs.readJson(packageJsonPath)
		delete packageJson.scripts.cleanup
		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
		console.log(chalk.gray('  - Removed "cleanup" script from package.json'))
	} catch (err) {
		console.error(chalk.red('Error updating package.json:', err))
	}

	// Удаляем сам скрипт
	await fs.remove(path.join(projectRoot, 'scripts'))
	console.log(chalk.gray('  - Removed: scripts/ folder'))

	console.log(chalk.green('\n✅ Cleanup complete! Your project is ready.'))
}

cleanup()
