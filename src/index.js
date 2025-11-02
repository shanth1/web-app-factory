#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const classicToAlphabeticalMap = {
	app: 'app',
	pages: 'pages',
	widgets: 'modules',
	features: 'features',
	entities: 'domain',
	shared: 'base',
}

function getPackageManager() {
	const userAgent = process.env.npm_config_user_agent
	if (userAgent) {
		if (userAgent.startsWith('yarn')) return 'yarn'
		if (userAgent.startsWith('pnpm')) return 'pnpm'
	}
	return 'npm'
}

async function run() {
	console.log(chalk.cyan('⚛️  Welcome to the Web App Factory!'))
	console.log(chalk.gray("Let's configure your new project."))

	const answers = await inquirer.prompt([
		{
			type: 'input',
			name: 'projectName',
			message: 'What is the name of your project?',
			default: 'my-awesome-app',
			validate: input =>
				input === '.' ||
				/^[a-z0-9-_]+$/.test(input) ||
				'Project name can only contain lowercase letters, numbers, hyphens, underscores, or be "." for the current directory.',
		},
		{
			type: 'list',
			name: 'template',
			message: 'Select a project template:',
			choices: [{ name: 'Vanilla JavaScript', value: 'vanilla-js' }],
		},
		{
			type: 'list',
			name: 'fsdNaming',
			message: 'Choose a Feature-Sliced Design naming convention:',
			choices: [
				{
					name: 'Classic (app, pages, widgets, features, entities, shared) - Recommended',
					value: 'classic',
				},
				{
					name: 'Alphabetical (app, base, domain, features, modules, pages)',
					value: 'alpha',
				},
			],
			default: 'classic',
		},
		{
			type: 'confirm',
			name: 'useTailwind',
			message: 'Add Tailwind CSS for styling?',
			default: false,
		},
		{
			type: 'confirm',
			name: 'usePwa',
			message: 'Enable Progressive Web App (PWA) features?',
			default: true,
		},
		{
			type: 'confirm',
			name: 'includeDocs',
			message: 'Include project documentation (FSD guide)?',
			default: true,
		},
		{
			type: 'confirm',
			name: 'includeScripts',
			message: 'Include helper scripts (component generator, cleanup)?',
			default: true,
		},
		{
			type: 'list',
			name: 'packageManager',
			message: 'Which package manager do you want to use?',
			choices: ['npm', 'yarn', 'pnpm'],
			default: getPackageManager(),
		},
	])

	const { projectName } = answers
	const isCurrentDir = projectName === '.'
	const targetPath = isCurrentDir
		? process.cwd()
		: path.join(process.cwd(), projectName)
	const targetDirName = isCurrentDir ? path.basename(targetPath) : projectName

	await createProjectDirectory(projectName, targetPath, isCurrentDir)

	console.log(
		chalk.blue(
			`\nCreating project in ${isCurrentDir ? 'current directory' : chalk.bold(targetDirName)}...`
		)
	)

	await copyTemplateFiles(targetPath, answers)
	await postProcessProject(targetPath, answers, targetDirName)

	printNextSteps(projectName, answers.packageManager, isCurrentDir)
}

async function createProjectDirectory(projectName, targetPath, isCurrentDir) {
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
	} else {
		await fs.ensureDir(targetPath)
	}
}

async function copyTemplateFiles(
	targetPath,
	{ template, includeDocs, includeScripts }
) {
	const templatesDir = path.resolve(__dirname, '../templates')
	const copyWithOverwrite = (src, dest) =>
		fs.copy(src, dest, { overwrite: true })

	await copyWithOverwrite(path.join(templatesDir, template), targetPath)
	await copyWithOverwrite(path.join(templatesDir, '_shared'), targetPath)

	if (includeDocs) {
		await copyWithOverwrite(
			path.join(templatesDir, '_extras', 'docs'),
			path.join(targetPath, 'docs')
		)
	}
	if (includeScripts) {
		await copyWithOverwrite(
			path.join(templatesDir, '_extras', 'scripts'),
			path.join(targetPath, 'scripts')
		)
	}
}

async function postProcessProject(targetPath, answers, targetDirName) {
	const {
		fsdNaming,
		useTailwind,
		usePwa,
		includeDocs,
		includeScripts,
		packageManager,
	} = answers

	let finalNamingMap = {
		app: 'app',
		pages: 'pages',
		widgets: 'widgets',
		features: 'features',
		entities: 'entities',
		shared: 'shared',
	}

	if (fsdNaming === 'alpha') {
		console.log(chalk.gray('  - Configuring alphabetical FSD layer naming...'))
		finalNamingMap = classicToAlphabeticalMap
		const srcPath = path.join(targetPath, 'src')
		for (const [oldName, newName] of Object.entries(classicToAlphabeticalMap)) {
			if (oldName !== newName) {
				const oldPath = path.join(srcPath, oldName)
				const newPath = path.join(srcPath, newName)
				if (await fs.pathExists(oldPath)) {
					await fs.move(oldPath, newPath, { overwrite: true })
				}
			}
		}
		const projectFiles = await getAllFiles(targetPath)
		for (const file of projectFiles) {
			if (/\.(js|cjs|mjs|css|html|md)$/.test(file)) {
				let content = await fs.readFile(file, 'utf8')
				let changed = false
				for (const [oldName, newName] of Object.entries(
					classicToAlphabeticalMap
				)) {
					if (oldName !== newName) {
						const regex = new RegExp(`([@/])(${oldName})([/'"])`, 'g')
						if (regex.test(content)) {
							content = content.replace(regex, `$1${newName}$3`)
							changed = true
						}
					}
				}
				if (changed) {
					await fs.writeFile(file, content, 'utf8')
				}
			}
		}
	}

	const packageJsonPath = path.join(targetPath, 'package.json')
	let packageJson = await fs.readJson(packageJsonPath)
	packageJson.name = targetDirName
	packageJson.version = '0.1.0'

	if (useTailwind) {
		packageJson.devDependencies = {
			...packageJson.devDependencies,
			tailwindcss: '^3.4.1',
			postcss: '^8.4.35',
			autoprefixer: '^10.4.18',
		}

		const tailwindTemplatesPath = path.join(__dirname, '../templates/_tailwind')
		await fs.copy(tailwindTemplatesPath, targetPath)

		const appLayerName = finalNamingMap.app
		const cssPath = path.join(
			targetPath,
			'src',
			appLayerName,
			'styles/index.css'
		)
		let cssContent = await fs.readFile(cssPath, 'utf8')
		cssContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${cssContent}`
		await fs.writeFile(cssPath, cssContent)
		console.log(chalk.gray('  - Added Tailwind CSS configuration.'))
	}

	if (!usePwa) {
		delete packageJson.dependencies['vite-plugin-pwa']

		const viteConfigPath = path.join(targetPath, 'vite.config.js')
		let viteConfig = await fs.readFile(viteConfigPath, 'utf8')
		viteConfig = viteConfig
			.replace(/import { VitePWA } from 'vite-plugin-pwa'/, '')
			.replace(/,?\s*VitePWA\({[^)]*\)\s*},?/, '')
		await fs.writeFile(viteConfigPath, viteConfig)

		const appLayerName = finalNamingMap.app
		const mainJsPath = path.join(targetPath, 'src', appLayerName, 'main.js')
		let mainJs = await fs.readFile(mainJsPath, 'utf8')
		mainJs = mainJs
			.replace(/import { registerSW } from 'virtual:pwa-register'/, '')
			.replace(/registerSW\({[^}]*\)\s*}\)/, '')
		await fs.writeFile(mainJsPath, mainJs)

		await fs
			.remove(path.join(targetPath, 'public', 'pwa-192x192.png'))
			.catch(() => {})
		await fs
			.remove(path.join(targetPath, 'public', 'pwa-512x512.png'))
			.catch(() => {})

		console.log(chalk.gray('  - Disabled PWA features.'))
	} else {
		console.log(chalk.gray('  - Enabled PWA features.'))
	}

	if (includeScripts) {
		const componentScriptPath = path.join(targetPath, 'scripts/component.js')
		const cleanupScriptPath = path.join(targetPath, 'scripts/cleanup.js')

		const layerChoices = [
			`${finalNamingMap.shared}/ui`,
			finalNamingMap.entities,
			finalNamingMap.features,
			finalNamingMap.widgets,
			finalNamingMap.pages,
		]

		const pathsToRemove = [
			`src/${finalNamingMap.features}`,
			`src/${finalNamingMap.widgets}`,
			`src/${finalNamingMap.pages}/user`,
		]

		let componentScript = await fs.readFile(componentScriptPath, 'utf8')
		componentScript = componentScript.replace(
			"'__LAYER_CHOICES__'",
			JSON.stringify(layerChoices)
		)
		await fs.writeFile(componentScriptPath, componentScript)

		let cleanupScript = await fs.readFile(cleanupScriptPath, 'utf8')
		cleanupScript = cleanupScript.replace(
			"'__PATHS_TO_REMOVE__'",
			JSON.stringify(pathsToRemove)
		)
		await fs.writeFile(cleanupScriptPath, cleanupScript)
		console.log(chalk.gray('  - Configured helper scripts.'))
	} else {
		delete packageJson.scripts['create:component']
		delete packageJson.scripts.cleanup
	}

	if (includeDocs) {
		const readmePath = path.join(targetPath, 'docs/README.md')
		let readmeContent = await fs.readFile(readmePath, 'utf-8')

		const installCmd = `${packageManager} install`
		const runCmd = packageManager === 'npm' ? 'npm run' : packageManager
		readmeContent = readmeContent
			.replaceAll('npm install', installCmd)
			.replaceAll('npm run', runCmd)

		const fsdStructure = Object.values(finalNamingMap)
			.sort()
			.map(layer => `- **\`src/${layer}\`**`)
			.join('\n')
		const fsdDescription = `The project follows the principles of FSD. Layer structure:\n\n${fsdStructure}`
		readmeContent = readmeContent.replace(
			'<!-- FSD_STRUCTURE -->',
			fsdDescription
		)

		await fs.writeFile(readmePath, readmeContent, 'utf-8')
		console.log(chalk.gray('  - Updated documentation.'))
	} else {
		await fs.remove(path.join(targetPath, 'docs')).catch(() => {})
	}

	await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

function printNextSteps(projectName, packageManager, isCurrentDir) {
	console.log(chalk.green('\n✅ Project created successfully!'))
	console.log('\nNext steps:')

	if (!isCurrentDir) {
		console.log(chalk.yellow(`  cd ${projectName}`))
	}

	const installCommand = `${packageManager} install`
	const devCommand = `${packageManager} ${packageManager === 'npm' ? 'run ' : ''}dev`

	console.log(chalk.yellow(`  ${installCommand}`))
	console.log(chalk.yellow(`  ${devCommand}`))
}

async function getAllFiles(dirPath, arrayOfFiles = []) {
	const files = await fs.readdir(dirPath)
	for (const file of files) {
		const fullPath = path.join(dirPath, file)
		if ((await fs.stat(fullPath)).isDirectory()) {
			if (file !== 'node_modules' && file !== '.git') {
				await getAllFiles(fullPath, arrayOfFiles)
			}
		} else {
			arrayOfFiles.push(fullPath)
		}
	}
	return arrayOfFiles
}

run().catch(error => {
	console.error(chalk.red('An error occurred:', error))
	process.exit(1)
})
