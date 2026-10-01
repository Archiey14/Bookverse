import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const dataFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "data"
);

const fileFor = (name) => path.join(dataFolder, `${name}.json`);

// Reads a collection. A missing file is an empty collection; any other
// problem (e.g. corrupt JSON) is thrown so we never overwrite good data
// with an empty list by accident.
export async function read(name) {
  let text;

  try {
    text = await fs.readFile(fileFor(name), "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }

  if (text.trim() === "") return [];
  return JSON.parse(text);
}

// Writes go to a temp file first and are then renamed, so a crash can't
// leave a half-written JSON file behind.
async function writeNow(name, data) {
  const target = fileFor(name);
  const temp = `${target}.${crypto.randomUUID()}.tmp`;

  await fs.writeFile(temp, JSON.stringify(data, null, 2));
  await fs.rename(temp, target);
}

// Jobs for the same collection run one at a time.
const queues = new Map();

function enqueue(name, task) {
  const previous = queues.get(name) ?? Promise.resolve();
  const next = previous.catch(() => {}).then(task);
  queues.set(name, next);
  return next;
}

export function write(name, data) {
  return enqueue(name, () => writeNow(name, data));
}

// Read -> change -> write as one step, so two requests at the same moment
// can't overwrite each other. `mutate` receives the array, changes it in
// place, and whatever it returns is passed back to the caller.
export function update(name, mutate) {
  return enqueue(name, async () => {
    const data = await read(name);
    const result = await mutate(data);
    await writeNow(name, data);
    return result;
  });
}
