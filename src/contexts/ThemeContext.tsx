import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
    theme: Theme
    actualTheme: "light" | "dark"
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme
        return saved || "system"
    })

    const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        let effectiveTheme: "light" | "dark" = "light"

        if (theme === "system") {
            effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        } else {
            effectiveTheme = theme
        }

        setActualTheme(effectiveTheme)
        root.classList.add(effectiveTheme)
        localStorage.setItem("theme", theme)
    }, [theme])

    useEffect(() => {
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
            const handleChange = () => {
                const root = window.document.documentElement
                root.classList.remove("light", "dark")
                const effectiveTheme = mediaQuery.matches ? "dark" : "light"
                setActualTheme(effectiveTheme)
                root.classList.add(effectiveTheme)
            }

            mediaQuery.addEventListener("change", handleChange)
            return () => mediaQuery.removeEventListener("change", handleChange)
        }
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}

