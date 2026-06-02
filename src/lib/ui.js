/* UI context: current language + theme, with the active translation slice.
   Kept component-free so it satisfies react-refresh/only-export-components;
   the matching <UIProvider> lives in components/UIProvider.jsx. */

import { createContext, useContext } from 'react'

export const UIContext = createContext(null)

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within <UIProvider>')
  return ctx
}
