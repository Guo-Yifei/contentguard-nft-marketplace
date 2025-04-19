import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
    extensions: [".js", ".jsx", ".json"],
  },
  build: {
    rollupOptions: {
      external: ["hardhat"],
    },
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  define: {
    // 确保环境变量可用于客户端代码
    "import.meta.env.VITE_FILEBASE_API_KEY": JSON.stringify(
      process.env.FILEBASE_API_KEY
    ),
    "import.meta.env.VITE_FILEBASE_SECRET": JSON.stringify(
      process.env.FILEBASE_SECRET
    ),
  },
  server: {
    // 如果需要从其他设备访问，可以打开此选项
    // host: '0.0.0.0',
    // 允许CORS
    cors: true,
  },
});
