export function h(tag, attributes, ...children) {
	const element = document.createElement(tag)

	for (const key in attributes) {
		if (key.startsWith('on') && typeof attributes[key] === 'function') {
			element.addEventListener(key.substring(2).toLowerCase(), attributes[key])
		} else if (key === 'className') {
			element.setAttribute('class', attributes[key])
		} else {
			element.setAttribute(key, attributes[key])
		}
	}

	children.flat().forEach(child => {
		if (typeof child === 'string' || typeof child === 'number') {
			element.append(document.createTextNode(child.toString()))
		} else if (child instanceof HTMLElement) {
			element.append(child)
		}
	})

	return element
}

export class ReactiveComponent {
	constructor(props = {}) {
		this.props = props
		this._element = null

		this.state = new Proxy(this.initialState() || {}, {
			set: (target, property, value) => {
				target[property] = value
				this._update()
				return true
			},
		})
	}

	initialState() {
		return {}
	}

	render() {
		throw new Error('Render method must be implemented')
	}

	_update() {
		const newElement = this.render()
		if (this._element && this._element.parentNode) {
			this._element.parentNode.replaceChild(newElement, this._element)
		}
		this._element = newElement
		this.componentDidUpdate()
	}

	forceUpdate() {
		this._update()
	}

	getElement() {
		if (!this._element) {
			this._element = this.render()
		}
		return this._element
	}

	_createDomElement() {
		throw new Error('Render method must be implemented')
	}

	componentDidMount() {}
	componentDidUpdate() {}
}
