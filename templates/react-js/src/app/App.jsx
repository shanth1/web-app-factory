import { HeaderWidget } from '@/widgets/HeaderWidget'
import { useHashNavigation } from './providers/router'

export function App() {
	const { page } = useHashNavigation()

	return (
		<>
			<HeaderWidget />
			<main id="page-container">{page}</main>
		</>
	)
}
