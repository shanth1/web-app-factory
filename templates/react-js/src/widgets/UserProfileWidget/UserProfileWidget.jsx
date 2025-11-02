import { useEffect } from 'react'
import { useUserStore } from '@/entities/user/model/store'
import { UserCard } from '@/entities/user/ui/UserCard'
import { ReloadUserButton } from '@/features/reload-user'
import './UserProfileWidget.css'

export const UserProfileWidget = () => {
	const { user, isLoading, fetchUser } = useUserStore()

	useEffect(() => {
		fetchUser()
	}, [fetchUser])

	return (
		<section className="user-profile-widget">
			<h1>User Profile</h1>
			<UserCard user={user} isLoading={isLoading} />
			<ReloadUserButton />
		</section>
	)
}
