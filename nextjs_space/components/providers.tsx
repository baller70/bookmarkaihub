
"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { OracleTrigger } from "@/components/oracle"

// Helper to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '59, 130, 246' // Default blue
}

// Calculate if color is light or dark to determine text color
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Oracle wrapper - only shows when authenticated
function OracleWrapper() {
  const { data: session } = useSession()
  
  // Only render Oracle trigger for authenticated users
  if (!session?.user) return null
  
  return <OracleTrigger />
}

// Apply saved settings on app load
function SettingsApplier({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load and apply saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        
        // Apply accent color with proper foreground
        if (settings.accentColor) {
          const accentColor = settings.accentColor
          document.documentElement.style.setProperty('--user-accent', accentColor)
          document.documentElement.style.setProperty('--user-accent-rgb', hexToRgb(accentColor))
          document.documentElement.style.setProperty('--user-accent-foreground', getContrastColor(accentColor))
        }
        
        // Apply font size
        if (settings.fontSize) {
          document.documentElement.style.setProperty('--user-font-size', `${settings.fontSize}px`)
        }
        
        // Apply dyslexia font
        if (settings.dyslexiaFont) {
          document.documentElement.classList.add('dyslexia-font')
        } else {
          document.documentElement.classList.remove('dyslexia-font')
        }
        
        // Apply reduced motion
        if (settings.reducedMotion) {
          document.documentElement.classList.add('reduced-motion')
        } else {
          document.documentElement.classList.remove('reduced-motion')
        }
        
        // Apply high contrast
        if (settings.highContrast) {
          document.documentElement.classList.add('high-contrast')
        } else {
          document.documentElement.classList.remove('high-contrast')
        }
        
        // Apply compact mode
        if (settings.compactMode) {
          document.documentElement.classList.add('compact-mode')
        } else {
          document.documentElement.classList.remove('compact-mode')
        }
      } catch (e) {
        console.error('Failed to apply saved settings:', e)
      }
    }
  }, [])
  
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="theme"
      >
        <SettingsApplier>
          {children}
        </SettingsApplier>
        <OracleWrapper />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  )
}
