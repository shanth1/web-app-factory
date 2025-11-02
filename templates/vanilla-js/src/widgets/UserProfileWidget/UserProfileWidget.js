import { ReactiveComponent, h } from '@/shared/lib/ReactiveComponent'
import { userStore } from '@/entities/user/model/store'
import { UserCard } from '@/entities/user/ui/UserCard'
import { ReloadUserButton } from '@/features/reload-user'
import './UserProfileWidget.css'

export class UserProfileWidget extends ReactiveComponent {
	constructor() {
		super()
		this.unsubscribeFromUserStore = userStore.subscribe(() =>
			this.forceUpdate()
		)
	}

	componentDidMount() {
		new ReloadUserButton().handleReload()
	}

	componentWillUnmount() {
		if (this.unsubscribeFromUserStore) {
			this.unsubscribeFromUserStore()
		}
	}

	render() {
		const state = userStore.state

		return h(
			'section',
			{ className: 'user-profile-widget' },
			h('h1', {}, 'User Profile'),
			new UserCard({
				user: state.user,
				isLoading: state.isLoading,
			}).getElement(),
			new ReloadUserButton({
				isLoading: state.isLoading,
				disabled: state.isLoading,
			}).getElement()
		)
	}
}
