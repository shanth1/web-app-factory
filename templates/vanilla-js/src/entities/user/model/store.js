import { createStore } from '@/shared/lib/createStore'

export const userStore = createStore({
	user: null,
	isLoading: true,
	error: null,
})
