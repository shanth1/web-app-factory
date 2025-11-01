import { ReactiveComponent, h } from '@/0-shared/lib/ReactiveComponent'
import './Button.css'

export class Button extends ReactiveComponent {
	_createDomElement() {
		const { text, onClick, variant = 'primary' } = this.props
		return h('button', { className: `button button-${variant}`, onClick }, text)
	}
}
