import './Button.css'

export const Button = ({
	text,
	onClick,
	variant = 'primary',
	disabled = false,
}) => {
	return (
		<button
			className={`button button-${variant}`}
			onClick={onClick}
			disabled={disabled}
		>
			{text}
		</button>
	)
}
