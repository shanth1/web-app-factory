export function createStore(initialState) {
	const listeners = new Set()

	const state = new Proxy(initialState, {
		set: (target, property, value) => {
			target[property] = value
			listeners.forEach(listener => listener())
			return true
		},
	})

	return {
		get state() {
			return state
		},
		subscribe(listener) {
			listeners.add(listener)
			return () => listeners.delete(listener) // Unsubscribe function
		},
	}
}
