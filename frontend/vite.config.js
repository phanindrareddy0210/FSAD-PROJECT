import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Using SWC for faster React builds
import { resolve } from 'path'; // For path resolution

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable SWC options if needed
      swcOptions: {
        jsc: {
          parser: {
            syntax: 'ecmascript',
            jsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic', // Use React 17+ automatic runtime
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      // Resolve react-icons correctly
      'react-icons': resolve(__dirname, 'node_modules/react-icons'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Support multiple file extensions
  },
  optimizeDeps: {
    // Pre-bundle dependencies to avoid transform errors
    include: ['react-icons/fa'],
  },
  build: {
    // Optimize build output
    sourcemap: true, // Helpful for debugging
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-icons')) {
            return 'vendor-react-icons'; // Separate react-icons into a chunk
          }
        },
      },
    },
  },
  server: {
    // Development server options
    open: true, // Auto-open browser
    port: 3000, // Default port
    strictPort: true, // Fail if port is occupied
  },
  envPrefix: 'REACT_APP_', // Prefix for environment variables
});