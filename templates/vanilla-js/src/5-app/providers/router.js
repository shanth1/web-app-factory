class Router {
	constructor() {
		this.routes = {}
		this.pageContainer = null
		this.currentPath = this.getCurrentPath()

		window.addEventListener('hashchange', () => this._onHashChange())
		window.addEventListener('DOMContentLoaded', () => this.resolve())
	}

	getCurrentPath() {
		return location.hash.replace('#', '') || '/'
	}

	_onHashChange() {
		this.currentPath = this.getCurrentPath()
		this.resolve()
	}

	setPageContainer(element) {
		this.pageContainer = element
	}

	setRoutes(routes) {
		this.routes = routes
		this.resolve()
	}

	navigate(path) {
		location.hash = path === '/' ? '' : `#${path}`
	}

	resolve() {
		if (!this.pageContainer) return

		const pageFactory = this.routes[this.currentPath]
		this.pageContainer.innerHTML = ''

		if (pageFactory) {
			const pageComponent = pageFactory()
			this.pageContainer.append(pageComponent.getElement())
			pageComponent.componentDidMount()
		} else {
			this.pageContainer.textContent = '404 | Page Not Found'
		}
	}
}

export const router = new Router()
