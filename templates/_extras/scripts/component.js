import fs from 'fs-extra'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'

const srcPath = path.join(process.cwd(), 'src')

const layerChoices = [
	'0-shared/ui',
	'1-entities',
	'2-features',
	'3-widgets',
	'4-pages',
]

const templates = {
	component:
		name => `import { ReactiveComponent, h } from '@/0-shared/lib/ReactiveComponent';
import './${name}.css';

export class ${name} extends ReactiveComponent {
  _createDomElement() {
    return h('div', { className: '${name.toLowerCase()}' }, '${name}');
  }
}
`,
	css: name => `.${name.toLowerCase()} {\n  /* Your styles here */\n}\n`,
	index: name => `export { ${name} } from './${name}';\n`,
}

async function createComponent() {
	const { layer, name } = await inquirer.prompt([
		{
			type: 'list',
			name: 'layer',
			message: 'Select the FSD layer for your component:',
			choices: layerChoices,
		},
		{
			type: 'input',
			name: 'name',
			message: 'Enter the component name (e.g., UserProfile):',
			validate: input =>
				/^[A-Z][A-Za-z0-9]+$/.test(input) ||
				'Component name must be in PascalCase.',
		},
	])

	const componentPath = path.join(srcPath, layer, name)
	if (await fs.pathExists(componentPath)) {
		console.error(
			chalk.red(`❌ Component ${name} already exists at ${componentPath}`)
		)
		return
	}

	await fs.ensureDir(componentPath)

	const files = {
		[`${name}.js`]: templates.component(name),
		[`${name}.css`]: templates.css(name),
		['index.js']: templates.index(name),
	}

	for (const [fileName, content] of Object.entries(files)) {
		await fs.writeFile(path.join(componentPath, fileName), content)
	}

	console.log(
		chalk.green(`\n✅ Component ${name} created successfully in ${layer}!`)
	)
}

createComponent()
