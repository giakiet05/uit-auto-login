import { defineConfig } from 'vite';

// Build config for content script only
// Service worker will be built separately
export default defineConfig({
	build: {
		lib: {
			entry: 'src/content.ts',
			formats: ['iife'],
			name: 'ContentScript'
		},
		rollupOptions: {
			output: {
				entryFileNames: 'content.js',
				extend: true
			}
		},
		outDir: 'dist',
		emptyOutDir: false // Don't clear dist folder
	}
});
