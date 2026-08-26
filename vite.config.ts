import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  const target = environment.VITE_SERVER_ORIGIN ||
    "https://amphi.dixonary.co.uk";

  return {
    plugins: [react()],
    server: {
      port: 3200,
      proxy: {
        "/auth": target,
        "/ws": { target, ws: true },
      },
    },
  };
});
