import { createStore } from '@/shared/lib/createStore'

const initialState = {
	count: 0,
}

export const store = createStore(initialState)
