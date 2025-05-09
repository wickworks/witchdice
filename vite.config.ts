import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react({
  	jsxRuntime: 'classic' // Add this line
  }), viteTsconfigPaths(), svgrPlugin()],
  resolve: {
    alias: {
      crypto: "empty-module",
    },
  },
  define: {
    global: "globalThis",
  },
});
