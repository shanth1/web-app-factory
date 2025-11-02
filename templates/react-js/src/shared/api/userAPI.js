export const fetchRandomUser = async () => {
	try {
		const userId = Math.floor(Math.random() * 10) + 1
		const response = await fetch(
			`https://jsonplaceholder.typicode.com/users/${userId}`
		)
		if (!response.ok) {
			throw new Error('Network response was not ok')
		}
		return await response.json()
	} catch (error) {
		console.error('Failed to fetch user:', error)
		return { name: 'Failed to load', email: 'error@example.com' }
	}
}
