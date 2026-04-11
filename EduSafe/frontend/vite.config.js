import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'], // allow JSX inside .js files
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/, // enable JSX in .js, .jsx, .ts, .tsx
  },
})
