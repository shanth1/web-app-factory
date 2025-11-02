import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.svg'],
			manifest: {
				name: 'React PWA Template',
				short_name: 'ReactPWA',
				description: 'A modern template for React PWA apps',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '.',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
