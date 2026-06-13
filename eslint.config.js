import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // React Three Fiber is imperative by design — every frame mutates Three.js
    // objects (camera.position, mesh.rotation, gltf scene transforms). The
    // React Compiler's immutability rule can't model that and would flag all
    // of it, so we opt these isolated 3D files out of that one rule.
    files: ['src/components/hero3d/**/*.{js,jsx}'],
    rules: { 'react-hooks/immutability': 'off' },
  },
])
