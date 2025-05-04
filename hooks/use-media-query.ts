// hooks/use-media-query.ts
import * as React from "react";

export function useMediaQuery(query: string) {
	const [value, setValue] = React.useState(false);

	React.useEffect(() => {
		function onChange(event: MediaQueryListEvent) {
			setValue(event.matches);
		}

		// Check if window is defined (for SSR compatibility)
		if (typeof window !== "undefined") {
			const result = window.matchMedia(query);
			// Set initial value
			setValue(result.matches);
			// Add listener for changes
			result.addEventListener("change", onChange);
			return () => result.removeEventListener("change", onChange);
		} else {
			// Default value during SSR (you might adjust this based on needs)
			setValue(false);
		}
	}, [query]);

	return value;
}
