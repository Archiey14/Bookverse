import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose, { Schema } from "mongoose";

const dataFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "data",
);

const collections = {
  books: new Schema(
    { id: { type: Number, required: true, unique: true, index: true } },
    { strict: false, versionKey: false, collection: "books" },
  ),
  users: new Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      name: String,
      email: { type: String, required: true, unique: true, lowercase: true, index: true },
      // Google-created accounts do not have a local password.
      password: String,
      googleId: String,
      role: { type: String, default: "user" },
    },
    { strict: false, versionKey: false, collection: "users" },
  ),
  orders: new Schema(
    {
      id: { type: Schema.Types.Mixed, required: true, index: true },
      userId: { type: Schema.Types.Mixed, index: true },
      items: [Schema.Types.Mixed],
      amount: Number,
      currency: String,
      status: String,
      paymentId: String,
      createdAt: String,
      paidAt: String,
    },
    { strict: false, versionKey: false, collection: "orders" },
  ),
  reviews: new Schema(
    {
      id: { type: String, required: true, unique: true, index: true },
      bookId: { type: Number, required: true, index: true },
      userId: { type: Number, required: true, index: true },
      userName: String,
      rating: Number,
      comment: String,
      createdAt: String,
      updatedAt: String,
    },
    { strict: false, versionKey: false, collection: "reviews" },
  ),
  shoppingStates: new Schema(
    {
      userId: { type: Number, required: true, unique: true, index: true },
      cart: { type: Schema.Types.Mixed, default: {} },
      wishlist: { type: [Number], default: [] },
      updatedAt: { type: Date, default: Date.now },
    },
    { strict: false, versionKey: false, collection: "shoppingStates" },
  ),
};

const models = Object.fromEntries(
  Object.entries(collections).map(([name, schema]) => [
    name,
    mongoose.models["Bookverse_" + name] ||
      mongoose.model("Bookverse_" + name, schema, name),
  ]),
);

const migrationSchema = new Schema(
  { key: { type: String, required: true, unique: true }, completedAt: Date },
  { versionKey: false, collection: "bookverse_migrations" },
);
const Migration =
  mongoose.models.BookverseMigration ||
  mongoose.model("BookverseMigration", migrationSchema);

function modelFor(name) {
  const model = models[name];
  if (!model) throw new Error("Unknown database collection: " + name);
  return model;
}

async function readLegacyJson(name) {
  try {
    const text = await fs.readFile(path.join(dataFolder, name + ".json"), "utf8");
    if (!text.trim()) return [];
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      throw new Error("Legacy data file must contain an array: " + name + ".json");
    }
    return data;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

// On first connection, import each existing JSON collection only when its
// MongoDB collection is empty. JSON files remain as local backups.
async function importLegacyJsonOnce() {
  const key = "legacy-json-import-v1";
  if (await Migration.exists({ key })) return;

  for (const name of Object.keys(collections)) {
    const Model = modelFor(name);
    await Model.init();

    if ((await Model.estimatedDocumentCount()) > 0) continue;

    const legacyData = await readLegacyJson(name);
    if (legacyData.length > 0) {
      await Model.insertMany(legacyData, { ordered: true });
      console.log("Imported " + legacyData.length + " " + name + " documents from JSON.");
    }
  }

  await Migration.create({ key, completedAt: new Date() });
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add your MongoDB connection string to backend/.env.");
  }

  await mongoose.connect(uri);
  await importLegacyJsonOnce();
  console.log("Connected to MongoDB.");
}

export async function read(name) {
  const Model = modelFor(name);
  return Model.find({}).select({ _id: 0, __v: 0 }).lean();
}

async function writeNow(name, data) {
  if (!Array.isArray(data)) {
    throw new TypeError("Collection writes must be arrays.");
  }

  const Model = modelFor(name);
  await Model.deleteMany({});
  if (data.length > 0) {
    await Model.insertMany(data, { ordered: true });
  }
}

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

export function update(name, mutate) {
  return enqueue(name, async () => {
    const data = await read(name);
    const result = await mutate(data);
    await writeNow(name, data);
    return result;
  });
}
