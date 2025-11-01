import { ReactiveComponent, h } from '@/0-shared/lib/ReactiveComponent'
import { UserProfileWidget } from '@/3-widgets/UserProfileWidget'

class UserPage extends ReactiveComponent {
	constructor() {
		super()
		this.userProfileWidget = new UserProfileWidget()
	}

	render() {
		return h(
			'div',
			{ className: 'user-page' },
			this.userProfileWidget.getElement()
		)
	}

	componentDidMount() {
		this.userProfileWidget.componentDidMount()
	}
}

export const getUserPage = () => new UserPage()
