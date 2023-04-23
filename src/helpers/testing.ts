import mongoose from "mongoose";

export async function clearDB() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(`mongodb://localhost:27017/dbDev`);
    mongoose.connection.db.dropDatabase();
  } else {
    mongoose.connection.db.dropDatabase();
  }
}

export async function closeDB() {
  await mongoose.connection.close();
}

export async function newObjectId() {
  return new mongoose.Types.ObjectId();
}
