import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    host: '0.0.0.0', // Allow access from any IP
    port: 5173, // Ensure this matches the port you are using
    https: true, // Enable HTTPS if using the SSL plugin
  },
});