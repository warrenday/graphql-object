// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GraphQL Object",
      fileName: "graphql-object",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["graphql", "graphql-tag"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          graphql: "graphql",
          "graphql-tag": "graphql-tag",
        },
      },
    },
  },
  plugins: [dts()],
});
