// Forge's Vite plugin injects these at build time. We declare them ourselves
// (rather than referencing @electron-forge/plugin-vite, whose source trips the
// TS7/vite type mismatch) so tsc only checks our code.
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;