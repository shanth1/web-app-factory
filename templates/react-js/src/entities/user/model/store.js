import { create } from 'zustand'
import { fetchRandomUser } from '@/shared/api/userAPI'

export const useUserStore = create(set => ({
	user: null,
	isLoading: true,
	error: null,
	fetchUser: async () => {
		set({ isLoading: true, error: null })
		try {
			const userData = await fetchRandomUser()
			set({ user: userData, isLoading: false })
		} catch (error) {
			set({ error: error.message, isLoading: false })
		}
	},
}))
