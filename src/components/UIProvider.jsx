import { useLayoutEffect, useMemo, useState } from 'react'
import { translations } from '../lib/i18n'
import { UIContext } from '../lib/ui'

const THEME_KEY = 'mas-theme'
const LANG_KEY = 'mas-lang'

export function UIProvider({ children }) {
  // Default to French (Tunisia); English is one toggle away.
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'fr')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light')

  // Apply + persist before paint so there's no flash of the wrong theme.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useLayoutEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    localStorage.setItem(LANG_KEY, lang)
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      theme,
      t: translations[lang],
      toggleLang: () => setLang((l) => (l === 'fr' ? 'en' : 'fr')),
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [lang, theme],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
