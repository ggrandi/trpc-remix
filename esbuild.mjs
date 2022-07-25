//@ts-check
import { build } from "esbuild";
import * as path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";

const cyan = (/** @type {string} */ text) => `\u001B[${36}m${text}\u001B[${39}m`;

/** @type {import("esbuild").Plugin} */
const extensionTransformerPlugin = {
	name: "extensionTransformerPlugin",
	setup(build) {
		if (build.initialOptions.write === false)
			throw "extensionTransformerPlugin Sets write to false to modify the files. Cannot be set to false";

		build.initialOptions.write = false;

		if (
			build.initialOptions.format === "esm" &&
			build.initialOptions.outExtension?.[".js"] === ".mjs"
		) {
			build.onEnd(async (res) => {
				if (!build.initialOptions.outdir) throw "options.outdir is required";

				Promise.all(
					(res.outputFiles ?? []).map(async ({ path: filePath, text }) => {
						const contents = text.replace(
							/from "\.\/(?<filename>.+)"/g,
							(_, filename) => `from "./${filename}.mjs"`
						);

						try {
							await mkdir(path.join(filePath, "../"), {
								recursive: true,
							});
						} catch {}

						writeFile(filePath, contents);
					})
				);
			});
		}
	},
};

/** @type {Omit<import("esbuild").BuildOptions, "entryPoints"> & { entryPoints: string[] }} */
const buildConfig = {
	entryPoints: [
		"src/createTRPCRemix.ts",
		"src/trpcLoader.ts",
		"src/index.ts",
		"src/withTRPC.tsx",
		"src/adapter/index.ts",
	],
	treeShaking: true,
	outdir: "dist/",
	platform: "node",
	target: ["es2020"],
	// minify: true,
};

/** @type {(Partial<Omit<import("esbuild").BuildOptions, "entryPoints">> & { entryPoints?: string[]; name: string})[]} */
const builds = [
	{
		name: "commonjs build",
		format: "cjs",
	},
	{
		plugins: [extensionTransformerPlugin],
		name: "esm build",
		outExtension: { ".js": ".mjs" },
		splitting: true,
		format: "esm",
	},
];

for (const { name: buildName, entryPoints, ...currentBuild } of builds) {
	console.log(cyan(`Building: ${buildName}`));

	build({
		...buildConfig,
		...currentBuild,
		entryPoints: [...buildConfig.entryPoints, ...(entryPoints ?? [])],
	}).catch((/** @type {unknown} */ err) => {
		console.error(err);
		process.exit(1);
	});
}
