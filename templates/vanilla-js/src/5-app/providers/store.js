import { createStore } from '@/0-shared/lib/createStore'

const initialState = {
	count: 0,
}

export const store = createStore(initialState)
