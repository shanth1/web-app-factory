import { ReactiveComponent, h } from '@/0-shared/lib/ReactiveComponent'
import './Button.css'

export class Button extends ReactiveComponent {
	render() {
		const { text, onClick, variant = 'primary', disabled = false } = this.props
		const buttonElement = h(
			'button',
			{ className: `button button-${variant}`, onClick },
			text
		)
		buttonElement.disabled = disabled
		return buttonElement
	}
}
