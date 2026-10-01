import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const dataFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "data"
);

export async function read(name) {
  try {
    const text = await fs.readFile(path.join(dataFolder, `${name}.json`), "utf8");
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function write(name, data) {
  await fs.writeFile(
    path.join(dataFolder, `${name}.json`),
    JSON.stringify(data, null, 2)
  );
}