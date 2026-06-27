// Bundles the plugin into a single self-contained `dist/main.js`.
//
// The Dot X SDK (`@dotmatrixlabs/dotx-plugin-sdk`) and its npm dependencies
// (socket.io-client, conf, adm-zip, ...) are inlined into the output so the
// plugin runs under Deno on any machine without needing the SDK installed or
// network access to npm. Only Node built-ins (node:fs, node:path, ...) stay
// external — Deno provides those natively.
import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";
import { builtinModules } from "node:module";

const nodeBuiltins = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);

// Some bundled deps (e.g. adm-zip) import Node built-ins bare (`require("fs")`).
// Deno requires the `node:` prefix, so rewrite + externalize them here.
const nodeBuiltinPrefix: esbuild.Plugin = {
  name: "node-builtin-prefix",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (nodeBuiltins.has(args.path)) {
        return { path: `node:${args.path.replace(/^node:/, "")}`, external: true };
      }
      return null;
    });
  },
};

const result = await esbuild.build({
  plugins: [
    nodeBuiltinPrefix,
    ...denoPlugins({ configPath: Deno.realPathSync("./deno.json") }),
  ],
  entryPoints: ["./main.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "./dist/main.js",
  // Provide a real `require` so dynamic `require()` calls in bundled CommonJS
  // deps (e.g. xmlhttprequest-ssl via socket.io-client) resolve at runtime.
  banner: {
    js: "import { createRequire as __cr } from 'node:module';\nconst require = __cr(import.meta.url);",
  },
  logLevel: "info",
});

if (result.errors.length > 0) {
  console.error(`Build failed with ${result.errors.length} error(s)`);
  Deno.exit(1);
}

console.log("Bundled plugin -> dist/main.js");
await esbuild.stop();
