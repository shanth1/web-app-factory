import { ReactiveComponent, h } from '@/0-shared/lib/ReactiveComponent'
import { Spinner } from '@/0-shared/ui/Spinner/Spinner'
import './UserCard.css'

export class UserCard extends ReactiveComponent {
	render() {
		const { user, isLoading } = this.props

		if (isLoading) {
			return h('div', { className: 'user-card loading' }, Spinner())
		}

		if (!user) {
			return h('div', { className: 'user-card' }, 'No user data.')
		}

		return h(
			'div',
			{ className: 'user-card' },
			h('h2', {}, user.name),
			h('p', {}, `Email: ${user.email}`)
		)
	}
}
