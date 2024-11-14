// vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()],
  server: {
    https: true, // Enable HTTPS
  },
};