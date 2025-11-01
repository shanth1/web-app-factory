import { createStore } from '@/0-shared/lib/createStore'

export const userStore = createStore({
	user: null,
	isLoading: true,
	error: null,
})
