import mongoose from "mongoose";
import config from "../config/config.mongodb";

const connectString = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;

class DataBase {
  private static instance: DataBase;
  constructor() {
    this.connect();
  }

  connect() {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then((_) => {
        console.log(`[MongoDB] Connected Mongodb ${connectString}`);
      })
      .catch((err) => console.log(`[MongoDB] Error Connect`));
  }

  static getInstance() {
    if (!DataBase.instance) {
      DataBase.instance = new DataBase();
    }
    return DataBase.instance;
  }
}

export default DataBase.getInstance();
