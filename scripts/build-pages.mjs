import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "_site");
const planner = join(root, "research-planner");

execFileSync("npm", ["run", "build", "--", "--no-lint"], {
    cwd: planner,
    stdio: "inherit",
    env: { ...process.env, VERCEL: "0", NEXT_TELEMETRY_DISABLED: "1" },
});

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

// Publish only website files, never environment files, PHP, or application source.
const extensions = new Set([
    ".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".svg", ".gif",
    ".webp", ".ico", ".pdf", ".woff", ".woff2", ".ttf", ".md", ".txt",
]);
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0").filter(Boolean);

for (const file of tracked) {
    const isWebsitePath = !file.includes("/") || /^(AlgVisualizer|Calendar|gomoku|testing)\//.test(file);
    if (!isWebsitePath || !extensions.has(extname(file).toLowerCase())) continue;
    const destination = join(output, file);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(root, file), destination);
}

if (!existsSync(join(output, "testing/tasks.js"))) {
    cpSync(join(root, "testing/tasks.js"), join(output, "testing/tasks.js"));
}
cpSync(join(planner, "out"), join(output, "research-planner"), { recursive: true });
cpSync(join(planner, "README.md"), join(output, "research-planner/README.md"));
writeFileSync(join(output, ".nojekyll"), "");

console.log(`Website built in ${output} (${readdirSync(output).length} top-level entries).`);
