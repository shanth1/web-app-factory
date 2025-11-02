import { ReactiveComponent, h } from '@/shared/lib/ReactiveComponent'
import { Button } from '@/shared/ui/Button'
import { fetchRandomUser } from '@/shared/api/userAPI'
import { userStore } from '@/entities/user/model/store'

export class ReloadUserButton extends ReactiveComponent {
	async handleReload() {
		userStore.state.isLoading = true

		const userData = await fetchRandomUser()

		userStore.state.user = userData
		userStore.state.isLoading = false
	}

	render() {
		const { isLoading } = this.props
		return new Button({
			text: isLoading ? 'Loading...' : 'Reload User',
			onClick: this.handleReload.bind(this),
			disabled: isLoading,
		}).render()
	}
}
