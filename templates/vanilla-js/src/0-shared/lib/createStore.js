import { createReactive } from './createReactive'

export function createStore(initialState) {
	const listeners = new Set()
	const notify = () => listeners.forEach(listener => listener())

	const state = createReactive(initialState, notify)

	return {
		get state() {
			return state
		},
		subscribe(listener) {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
	}
}
