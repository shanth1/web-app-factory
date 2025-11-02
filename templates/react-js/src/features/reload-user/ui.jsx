import { Button } from '@/shared/ui/Button'
import { useUserStore } from '@/entities/user/model/store'

export const ReloadUserButton = () => {
	const { isLoading, fetchUser } = useUserStore()

	return (
		<Button
			text={isLoading ? 'Loading...' : 'Reload User'}
			onClick={fetchUser}
			disabled={isLoading}
		/>
	)
}
