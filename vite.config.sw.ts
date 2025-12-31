import { defineConfig } from 'vite';

// Build config for service worker
export default defineConfig({
	build: {
		lib: {
			entry: 'src/service-worker.ts',
			formats: ['iife'],
			name: 'ServiceWorker'
		},
		rollupOptions: {
			output: {
				entryFileNames: 'service-worker.js',
				extend: true
			}
		},
		outDir: 'dist',
		emptyOutDir: false // Don't clear dist folder
	}
});
