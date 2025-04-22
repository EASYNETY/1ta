/**
 * Motion tokens for consistent animation throughout the application
 */
export const MotionTokens = {
	// Duration values in seconds
	duration: {
		fast: 0.15,
		medium: 0.3,
		slow: 0.5,
		extraSlow: 0.8,
	},

	// Easing curves
	ease: {
		// Standard easing
		standard: [0.4, 0.0, 0.2, 1],
		// For elements entering the screen
		easeOut: [0.0, 0.0, 0.2, 1],
		// For elements leaving the screen
		easeIn: [0.4, 0.0, 1, 1],
		// For subtle animations
		subtle_easeInOut: [0.4, 0.0, 0.6, 1],
	},

	// Spring configurations for natural motion
	spring: {
		// Default spring for most UI elements
		default: {
			type: "spring",
			stiffness: 400,
			damping: 30,
		},
		// Bouncy spring for playful elements
		bouncy: {
			type: "spring",
			stiffness: 300,
			damping: 10,
		},
		// Gentle spring for subtle animations
		gentle: {
			type: "spring",
			stiffness: 200,
			damping: 25,
		},
	},

	// Transition defaults
	transition: {
		default: {
			duration: 0.3,
			ease: [0.4, 0.0, 0.2, 1],
		},
	},
} as const;
