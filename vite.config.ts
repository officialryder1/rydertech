import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		include: ['svelte-sonner']
	},
	ssr: {
		noExternal: ['svelte-sonner']
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// split vendor chunks for better caching
					'vendor': ['svelte', '@sveltejs/kit'],
					'ui': ['@lucide/svelte', 'svelte-sonner']
				}
			}
		}

	},
	server: {
    fs: {
      // Allow serving files from project root
      allow: ['..']
    }
  }
});
