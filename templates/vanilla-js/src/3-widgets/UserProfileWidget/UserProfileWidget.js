import { ReactiveComponent, h } from '@/0-shared/lib/ReactiveComponent'
import { userStore } from '@/1-entities/user/model/store'
import { UserCard } from '@/1-entities/user/ui/UserCard'
import { ReloadUserButton } from '@/2-features/reload-user'
import './UserProfileWidget.css'

export class UserProfileWidget extends ReactiveComponent {
	constructor() {
		super()
		userStore.subscribe(() => this.forceUpdate())
	}

	componentDidMount() {
		new ReloadUserButton().handleReload()
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
