import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
}

export function Button({
	variant = "primary",
	size = "md",
	fullWidth = false,
	className,
	children,
	...props
}: ButtonProps) {
	const classes = [
		"btn",
		`btn--${variant}`,
		`btn--${size}`,
		fullWidth && "btn--full",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button className={classes} {...props}>
			{children}
		</button>
	);
}
