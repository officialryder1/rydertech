import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), imagetools()],
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
