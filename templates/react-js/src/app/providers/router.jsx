import { useState, useEffect, useMemo } from 'react'
import { UserPage } from '@/pages/user'

const routes = {
	'/': <UserPage />,
}

const getCurrentPath = () => location.hash.replace('#', '') || '/'

export const useHashNavigation = () => {
	const [path, setPath] = useState(getCurrentPath())

	useEffect(() => {
		const handleHashChange = () => setPath(getCurrentPath())
		window.addEventListener('hashchange', handleHashChange)
		return () => window.removeEventListener('hashchange', handleHashChange)
	}, [])

	const page = useMemo(
		() => routes[path] || <div>404 | Page Not Found</div>,
		[path]
	)

	return { path, page }
}

export const navigate = path => {
	location.hash = path === '/' ? '' : `#${path}`
}
