import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Main build config for popup UI only
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			input: {
				popup: 'index.html'
			},
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'assets/[name].[ext]'
			}
		},
		outDir: 'dist',
		emptyOutDir: true
	}
});
