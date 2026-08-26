import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  const target = environment.VITE_SERVER_ORIGIN || "http://localhost:3201";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/auth": target,
        "/ws": { target, ws: true },
      },
    },
  };
});
