//------------------- development -------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});

// /*------------------- production -------------------*/
// import path from "path";
// import react from "@vitejs/plugin-react";
// import { defineConfig } from "vite";

// export default defineConfig({
//   server: {
//     host: "0.0.0.0",
//     port: 5174,
//     allowedHosts: ["play-learn.xyz", "www.play-learn.xyz"],
//   },
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });
