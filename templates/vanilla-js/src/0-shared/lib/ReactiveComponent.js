import { createReactive } from './createReactive'

/**
 * Creates a VNode (virtual node), a lightweight JavaScript representation of a DOM element.
 * @param {string} tag
 * @param {object} props
 * @param  {...(VNode|string)} children
 * @returns {VNode}
 */
export function h(tag, props, ...children) {
	return {
		tag,
		props: props || {},
		children: children.flat(),
	}
}

/**
 * Creates a real DOM element from a VNode.
 * @param {VNode} vnode
 * @returns {HTMLElement|Text}
 */
function createDOMElement(vnode) {
	if (typeof vnode === 'string' || typeof vnode === 'number') {
		return document.createTextNode(vnode.toString())
	}

	const { tag, props, children } = vnode
	const element = document.createElement(tag)

	for (const key in props) {
		setAttribute(element, key, props[key])
	}

	children.forEach(child => {
		element.appendChild(createDOMElement(child))
	})

	vnode.dom = element
	return element
}

/**
 * Sets an attribute or event handler on a DOM element.
 * @param {HTMLElement} target
 * @param {string} name
 * @param {*} value
 */
function setAttribute(target, name, value) {
	if (name.startsWith('on') && typeof value === 'function') {
		const eventName = name.substring(2).toLowerCase()
		target.addEventListener(eventName, value)
	} else if (name === 'className') {
		target.setAttribute('class', value)
	} else if (typeof value === 'boolean') {
		if (value) {
			target.setAttribute(name, '')
		} else {
			target.removeAttribute(name)
		}
	} else {
		target.setAttribute(name, value)
	}
}

/**
 * Compares two VNode and updates the DOM tree.
 * @param {HTMLElement} parent
 * @param {VNode} newVNode
 * @param {VNode} oldVNode
 * @param {number} index
 */
function patch(parent, newVNode, oldVNode, index = 0) {
	const domElement = parent.childNodes[index]

	if (newVNode === undefined) {
		parent.removeChild(domElement)
	} else if (oldVNode === undefined) {
		parent.appendChild(createDOMElement(newVNode))
	} else if (typeof newVNode === 'string' || typeof newVNode === 'number') {
		if (domElement.nodeValue !== newVNode.toString()) {
			domElement.nodeValue = newVNode.toString()
		}
	} else if (newVNode.tag !== oldVNode.tag) {
		parent.replaceChild(createDOMElement(newVNode), domElement)
	} else {
		updateProps(domElement, newVNode.props, oldVNode.props)
		patchChildren(domElement, newVNode.children, oldVNode.children)
		newVNode.dom = domElement
	}
}

/**
 * Updates attributes/props on an existing DOM element.
 */
function updateProps(target, newProps, oldProps) {
	const allProps = { ...oldProps, ...newProps }
	for (const name in allProps) {
		if (newProps[name] === undefined) {
			target.removeAttribute(name === 'className' ? 'class' : name)
		} else if (
			oldProps[name] === undefined ||
			newProps[name] !== oldProps[name]
		) {
			setAttribute(target, name, newProps[name])
		}
	}
}

/**
 * Recursively updates child nodes.
 */
function patchChildren(parent, newChildren, oldChildren) {
	const len = Math.max(newChildren.length, oldChildren.length)
	for (let i = 0; i < len; i++) {
		patch(parent, newChildren[i], oldChildren[i], i)
	}
}

// =========================================================
// MAIN COMPONENT CLASS
// =========================================================

export class ReactiveComponent {
	constructor(props = {}) {
		this.props = props
		this._element = null
		this._vnode = null

		this.state = createReactive(this.initialState() || {}, () => this._update())
	}

	initialState() {
		return {}
	}

	render() {
		throw new Error('Render method must be implemented')
	}

	_update() {
		const newVNode = this.render()
		patch(this._element.parentNode, newVNode, this._vnode)
		this._vnode = newVNode
		this.componentDidUpdate()
	}

	forceUpdate() {
		this._update()
	}

	getElement() {
		if (!this._element) {
			this._vnode = this.render()
			this._element = createDOMElement(this._vnode)
		}
		return this._element
	}

	componentDidMount() {}
	componentDidUpdate() {}
	componentWillUnmount() {}
}
