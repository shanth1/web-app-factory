import { Spinner } from '@/shared/ui/Spinner'
import './UserCard.css'

export const UserCard = ({ user, isLoading }) => {
	if (isLoading) {
		return (
			<div className="user-card loading">
				<Spinner />
			</div>
		)
	}

	if (!user) {
		return <div className="user-card">No user data.</div>
	}

	return (
		<div className="user-card">
			<h2>{user.name}</h2>
			<p>Email: {user.email}</p>
		</div>
	)
}
