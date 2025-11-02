import { ReactiveComponent, h } from '@/shared/lib/ReactiveComponent'
import './HeaderWidget.css'

export class HeaderWidget extends ReactiveComponent {
	constructor() {
		super()
	}

	handleNavigate(event, path) {
		event.preventDefault()
		this.props.router.navigate(path)
	}

	render() {
		return h(
			'header',
			{ className: 'header-widget' },
			h(
				'nav',
				{ className: 'header-widget-nav' },
				h(
					'a',
					{
						href: '#/',
						className: 'nav-link',
						onClick: e => this.handleNavigate(e, '/'),
					},
					'User Page'
				)
			)
		)
	}
}
