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
	server: {
    fs: {
      // Allow serving files from project root
      allow: ['..']
    }
  }
});
