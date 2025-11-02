#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const classicFsdMap = {
	app: 'app',
	pages: 'pages',
	widgets: 'widgets',
	features: 'features',
	entities: 'entities',
	shared: 'shared',
}

const classicToAlphabeticalMap = {
	app: 'app',
	pages: 'pages',
	widgets: 'modules',
	features: 'features',
	entities: 'domain',
	shared: 'base',
}

async function run() {
	console.log(chalk.cyan('⚛️  Welcome to the Web App Factory!'))
	console.log(chalk.gray("Let's configure your new project."))

	const answers = await getProjectConfiguration()

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

	if (answers.usePrettier) {
		formatProject(targetPath)
	}

	printNextSteps(projectName, answers.packageManager, isCurrentDir)
}

function getProjectConfiguration() {
	return inquirer.prompt([
		{
			type: 'input',
			name: 'projectName',
			message: 'What is the name of your project?',
			default: 'my-awesome-app',
			validate: input =>
				input === '.' ||
				/^[a-z0-9-_]+$/.test(input) ||
				'Project name must be valid.',
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
			name: 'usePrettier',
			message: 'Setup Prettier for code formatting?',
			default: true,
		},
		{
			type: 'list',
			name: 'tabWidth',
			message: 'Select tab width:',
			choices: [2, 4],
			default: 2,
			when: answers => answers.usePrettier,
		},
		{
			type: 'confirm',
			name: 'singleQuote',
			message: 'Use single quotes instead of double quotes?',
			default: true,
			when: answers => answers.usePrettier,
		},
		{
			type: 'confirm',
			name: 'useSemicolons',
			message: 'Use semicolons at the end of statements?',
			default: true,
			when: answers => answers.usePrettier,
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
			default: () => {
				const userAgent = process.env.npm_config_user_agent
				if (userAgent?.startsWith('yarn')) return 'yarn'
				if (userAgent?.startsWith('pnpm')) return 'pnpm'
				return 'npm'
			},
		},
	])
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
	const copy = (src, dest) => fs.copy(src, dest, { overwrite: true })

	await copy(path.join(templatesDir, template), targetPath)
	await copy(path.join(templatesDir, '_shared'), targetPath)

	if (includeDocs) {
		await copy(
			path.join(templatesDir, '_extras', 'docs'),
			path.join(targetPath, 'docs')
		)
	}
	if (includeScripts) {
		await copy(
			path.join(templatesDir, '_extras', 'scripts'),
			path.join(targetPath, 'scripts')
		)
	}
}

async function postProcessProject(targetPath, answers, targetDirName) {
	const packageJsonPath = path.join(targetPath, 'package.json')
	let packageJson = await fs.readJson(packageJsonPath)

	packageJson.name = targetDirName
	packageJson.version = '0.1.0'

	const finalNamingMap = await handleFsdNaming(targetPath, answers.fsdNaming)

	if (answers.useTailwind) {
		await handleTailwind(targetPath, packageJson, finalNamingMap)
	}

	if (!answers.usePwa) {
		await handlePwa(targetPath, packageJson, finalNamingMap)
	} else {
		console.log(chalk.gray('  - Enabled PWA features.'))
	}

	if (answers.usePrettier) {
		await handlePrettier(targetPath, packageJson, answers)
	}

	await handleScriptsAndDocs(targetPath, packageJson, answers, finalNamingMap)

	await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
}

async function handleFsdNaming(targetPath, fsdNaming) {
	if (fsdNaming === 'classic') {
		console.log(chalk.gray('  - Using classic FSD layer naming.'))
		return classicFsdMap
	}

	console.log(chalk.gray('  - Configuring alphabetical FSD layer naming...'))
	const srcPath = path.join(targetPath, 'src')
	for (const [oldName, newName] of Object.entries(classicToAlphabeticalMap)) {
		if (oldName !== newName) {
			await fs.move(path.join(srcPath, oldName), path.join(srcPath, newName), {
				overwrite: true,
			})
		}
	}

	const projectFiles = await getAllFiles(targetPath)
	for (const file of projectFiles) {
		if (/\.(js|cjs|mjs|css|html|md)$/.test(file)) {
			let content = await fs.readFile(file, 'utf8')
			for (const [oldName, newName] of Object.entries(
				classicToAlphabeticalMap
			)) {
				if (oldName !== newName) {
					const regex = new RegExp(`([@/])(${oldName})([/'"])`, 'g')
					content = content.replace(regex, `$1${newName}$3`)
				}
			}
			await fs.writeFile(file, content, 'utf8')
		}
	}
	return classicToAlphabeticalMap
}

async function handleTailwind(targetPath, packageJson) {
	packageJson.devDependencies['tailwindcss'] = '^3.4.1'
	packageJson.devDependencies['postcss'] = '^8.4.35'
	packageJson.devDependencies['autoprefixer'] = '^10.4.18'

	await fs.copy(path.join(__dirname, '../templates/_tailwind'), targetPath)

	const cssPath = path.join(targetPath, 'src/app/styles/index.css')
	let cssContent = await fs.readFile(cssPath, 'utf8')
	cssContent = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${cssContent}`
	await fs.writeFile(cssPath, cssContent)
	console.log(chalk.gray('  - Added Tailwind CSS configuration.'))
}

async function handlePwa(targetPath, packageJson, finalNamingMap) {
	delete packageJson.dependencies['vite-plugin-pwa']

	const viteConfigPath = path.join(targetPath, 'vite.config.js')
	let viteConfig = await fs.readFile(viteConfigPath, 'utf8')
	viteConfig = viteConfig
		.replace(/import { VitePWA } from 'vite-plugin-pwa'/, '')
		.replace(/,?\s*VitePWA\({[^)]*\)\s*},?/, '')
	await fs.writeFile(viteConfigPath, viteConfig)

	const mainJsPath = path.join(targetPath, 'src', finalNamingMap.app, 'main.js')
	let mainJs = await fs.readFile(mainJsPath, 'utf8')
	mainJs = mainJs
		.replace(/import { registerSW } from 'virtual:pwa-register'/, '')
		.replace(/registerSW\({[^}]*\)\s*}\)/, '')
	await fs.writeFile(mainJsPath, mainJs)

	await fs
		.remove(path.join(targetPath, 'public/pwa-192x192.png'))
		.catch(() => {})
	await fs
		.remove(path.join(targetPath, 'public/pwa-512x512.png'))
		.catch(() => {})

	console.log(chalk.gray('  - Disabled PWA features.'))
}

async function handlePrettier(
	targetPath,
	packageJson,
	{ tabWidth, singleQuote, useSemicolons }
) {
	const basePrettierConfig = {
		printWidth: 80,
		useTabs: false,
		trailingComma: 'es5',
	}

	const prettierConfig = {
		...basePrettierConfig,
		tabWidth: tabWidth,
		singleQuote: singleQuote,
		semi: useSemicolons,
	}

	await fs.writeJson(path.join(targetPath, '.prettierrc'), prettierConfig, {
		spaces: 2,
	})

	packageJson.devDependencies['prettier'] = '^3.2.5'
	packageJson.devDependencies['eslint-config-prettier'] = '^9.1.0'
	packageJson.scripts['format'] = 'prettier --write .'
	console.log(chalk.gray('  - Added Prettier configuration and format script.'))
}

async function handleScriptsAndDocs(
	targetPath,
	packageJson,
	{ includeScripts, includeDocs, packageManager },
	finalNamingMap
) {
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
}

function formatProject(targetPath) {
	console.log(chalk.gray('\n  - Formatting initial project files...'))
	try {
		execSync(`npx prettier --write .`, { cwd: targetPath, stdio: 'ignore' })
	} catch (error) {
		console.warn(
			chalk.yellow(
				'Could not format project files. Please run the "format" script manually.'
			)
		)
	}
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
