import { ReactiveComponent, h } from '@/shared/lib/ReactiveComponent'
import { UserProfileWidget } from '@/widgets/UserProfileWidget'

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
