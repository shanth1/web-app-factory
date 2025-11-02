import { navigate } from '@/app/providers/router'
import './HeaderWidget.css'

export const HeaderWidget = () => {
	const handleNavigate = (e, path) => {
		e.preventDefault()
		navigate(path)
	}

	return (
		<header className="header-widget">
			<nav className="header-widget-nav">
				<a href="#/" className="nav-link" onClick={e => handleNavigate(e, '/')}>
					User Page
				</a>
			</nav>
		</header>
	)
}
