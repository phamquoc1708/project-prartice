import mongoose from "mongoose";

export async function clearDB() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(`mongodb://localhost:27017/dbDev`);
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      console.log(err);
    }
  } else {
    await mongoose.connection.db.dropDatabase();
  }
}

export async function closeDB() {
  await mongoose.connection.close();
}

export function newObjectId() {
  return new mongoose.Types.ObjectId();
}
