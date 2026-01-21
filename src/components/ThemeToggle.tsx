import { useEffect } from "react"

export function ThemeToggle() {
  // Force dark theme always
  useEffect(() => {
    document.documentElement.classList.remove("light", "system")
    document.documentElement.classList.add("dark")
  }, [])

  return null // Hide the toggle button since we're forcing dark mode
}