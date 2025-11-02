#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const templatesDir = path.resolve(__dirname, '../templates')

function getPackageManager() {
	const userAgent = process.env.npm_config_user_agent
	if (userAgent) {
		if (userAgent.startsWith('npm')) return 'npm'
		if (userAgent.startsWith('yarn')) return 'yarn'
		if (userAgent.startsWith('pnpm')) return 'pnpm'
	}
	return 'npm'
}

async function run() {
	console.log(chalk.cyan('⚛️  Welcome to the Awesome App Generator!'))
	console.log(chalk.gray("Let's create a new project from a template."))

	const initialPackageManager = getPackageManager()

	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'projectName',
			message: 'What is the name of your project?',
			default: 'my-awesome-app',
			validate: input =>
				input === '.' ||
				/^[a-z0-9-_]+$/.test(input) ||
				'Project name can only contain lowercase letters, numbers, hyphens, underscores, or be "." for current directory.',
		},
		{
			type: 'list',
			name: 'template',
			message: 'Select a project template:',
			choices: [{ name: 'Vanilla JavaScript', value: 'vanilla-js' }],
		},
		{
			type: 'confirm',
			name: 'includeExtras',
			message: 'Include documentation and helper scripts (recommended)?',
			default: true,
		},
		{
			type: 'list',
			name: 'packageManager',
			message: 'Which package manager do you want to use?',
			choices: ['npm', 'yarn', 'pnpm'],
			default: initialPackageManager,
		},
	])

	const { projectName, template, includeExtras, packageManager } = answers

	const isCurrentDir = projectName === '.'
	const targetPath = isCurrentDir
		? process.cwd()
		: path.join(process.cwd(), projectName)

	const targetDirName = isCurrentDir ? path.basename(targetPath) : projectName

	if (!isCurrentDir && (await fs.pathExists(targetPath))) {
		console.error(chalk.red(`❌ Directory "${projectName}" already exists.`))
		process.exit(1)
	}

	if (isCurrentDir) {
		const files = await fs.readdir(targetPath)
		if (files.length > 0) {
			const { overwrite } = await inquirer.prompt({
				type: 'confirm',
				name: 'overwrite',
				message: 'Current directory is not empty. Proceed anyway?',
				default: false,
			})
			if (!overwrite) {
				console.log(chalk.yellow('Operation cancelled.'))
				process.exit(0)
			}
		}
	}

	if (!isCurrentDir) {
		await fs.ensureDir(targetPath)
	}

	console.log(
		chalk.blue(
			`\nCreating project in ${isCurrentDir ? 'current directory' : chalk.bold(targetDirName)}...`
		)
	)

	const templatePath = path.join(templatesDir, template)
	const sharedPath = path.join(templatesDir, '_shared')
	const extrasPath = path.join(templatesDir, '_extras')

	await fs.copy(templatePath, targetPath)
	await fs.copy(sharedPath, targetPath, { overwrite: true })
	if (includeExtras) {
		await fs.copy(extrasPath, targetPath, { overwrite: true })
	}

	const packageJsonPath = path.join(targetPath, 'package.json')
	const packageJson = await fs.readJson(packageJsonPath)

	packageJson.name = targetDirName
	packageJson.version = '0.1.0'

	if (!includeExtras) {
		delete packageJson.scripts.cleanup
		delete packageJson.scripts['create:component']
	}

	await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

	if (includeExtras) {
		const readmePath = path.join(targetPath, 'docs', 'README.md')
		try {
			let readmeContent = await fs.readFile(readmePath, 'utf-8')
			const installCmd = `${packageManager} install`
			const runCmd = packageManager === 'npm' ? 'npm run' : packageManager

			readmeContent = readmeContent.replaceAll('npm install', installCmd)
			readmeContent = readmeContent.replaceAll('npm run', runCmd)

			await fs.writeFile(readmePath, readmeContent, 'utf-8')
			console.log(
				chalk.gray(
					'  - Updated README.md with selected package manager commands.'
				)
			)
		} catch (error) {
			console.warn(chalk.yellow('Could not update README.md:', error.message))
		}
	}

	console.log(chalk.green('\n✅ Project created successfully!'))
	console.log('\nNext steps:')

	if (!isCurrentDir) {
		console.log(chalk.yellow(`  cd ${projectName}`))
	}

	switch (packageManager) {
		case 'yarn':
			console.log(chalk.yellow('  yarn install'))
			console.log(chalk.yellow('  yarn dev'))
			break
		case 'pnpm':
			console.log(chalk.yellow('  pnpm install'))
			console.log(chalk.yellow('  pnpm run dev'))
			break
		default: // npm
			console.log(chalk.yellow('  npm install'))
			console.log(chalk.yellow('  npm run dev'))
			break
	}
}

run().catch(error => {
	console.error(chalk.red('An error occurred:', error))
	process.exit(1)
})
