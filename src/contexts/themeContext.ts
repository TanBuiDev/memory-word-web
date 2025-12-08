import { createContext, useContext } from "react"

export type Theme = "light" | "dark" | "system"

export interface ThemeContextType {
    theme: Theme
    actualTheme: "light" | "dark"
    setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}

