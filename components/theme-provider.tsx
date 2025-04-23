// components/theme-provider.tsx
"use client"; // **Essential:** Theme providers need client-side logic (localStorage, hooks)

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { Moon, Sun } from "lucide-react"; // Example icons
import { useTheme } from "next-themes";
import { DyraneButton } from "./dyrane-ui/dyrane-button";


/**
 * ThemeProvider Component
 *
 * This component wraps the ThemeProvider from the `next-themes` library.
 * It's marked as a client component ('use client') because theme management
 * relies on browser features like localStorage and the `useTheme` hook.
 *
 * It passes all received props down to the underlying NextThemesProvider,
 * allowing configuration like setting the attribute ('class' or 'data-theme'),
 * default theme, enabling system preference detection, etc.
 *
 * @param {ThemeProviderProps} props - Props accepted by the `next-themes` ThemeProvider.
 *                                   Includes `children` and configuration options.
 *
 * Common Props Used (as seen in RootLayout):
 * - `attribute="class"`: Applies the theme ('light' or 'dark') as a class to the `<html>` element.
 *                        Crucial for TailwindCSS dark mode (`dark:` variants).
 * - `defaultTheme="system"`: Uses the user's operating system preference as the default
 *                            if no theme is explicitly set or stored.
 * - `enableSystem`: Enables detection and application of the system theme.
 * - `disableTransitionOnChange`: Prevents theme transitions (like CSS transitions)
 *                                from running when the theme initially loads or changes,
 *                                avoiding potential visual glitches.
 * @returns {JSX.Element} - The rendered ThemeProvider component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // Render the actual provider from the library, passing down children and all other props
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <DyraneButton
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </DyraneButton>
    );
}
