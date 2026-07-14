import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env");
const envExamplePath = path.join(rootDir, ".env.example");

function parseEnv(content) {
  const entries = [];

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      entries.push({ raw: line });
      continue;
    }

    const key = match[1];
    let value = match[2] ?? "";

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries.push({ key, value });
  }

  return entries;
}

function stringifyEnv(entries) {
  return `${entries
    .map((entry) => {
      if (!entry.key) return entry.raw ?? "";
      return `${entry.key}="${entry.value}"`;
    })
    .join("\n")}\n`;
}

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("[doctor] .env dibuat dari .env.example");
  } else {
    fs.writeFileSync(
      envPath,
      'DATABASE_URL="postgresql://username:password@host:5432/hoodwood?sslmode=require"\nNEXTAUTH_SECRET="change-me"\nNEXTAUTH_URL="http://localhost:3000"\n',
      "utf8"
    );
    console.log("[doctor] .env default dibuat");
  }
}

const content = fs.readFileSync(envPath, "utf8");
const entries = parseEnv(content);
const map = new Map(entries.filter((entry) => entry.key).map((entry) => [entry.key, entry]));

let changed = false;

if (!map.has("DATABASE_URL")) {
  entries.push({
    key: "DATABASE_URL",
    value: "postgresql://username:password@host:5432/hoodwood?sslmode=require",
  });
  changed = true;
}

if (!map.has("NEXTAUTH_URL")) {
  entries.push({ key: "NEXTAUTH_URL", value: "http://localhost:3000" });
  changed = true;
}

if (changed) {
  fs.writeFileSync(envPath, stringifyEnv(entries), "utf8");
  console.log("[doctor] .env diperbaiki agar kompatibel untuk mode lokal");
} else {
  console.log("[doctor] konfigurasi .env sudah valid");
}
