/* Merged into window.<globalName> via cfg.extraEntries so the brand wordmark,
   the icon system, and the UI provider are importable by the design agent even
   though they live outside the scanned component folder (cfg.srcDir =
   src/components/app). UIProvider supplies translations (useUI `t`) + theme. */
export { Brand } from '../src/components/Brand'
export { Icon } from '../src/lib/Icon'
export { UIProvider } from '../src/components/UIProvider'
