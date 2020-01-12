import { config } from "dotenv";

config();

switch (process.env.NODE_ENV) {
  case "production":
    global.__DEV__ = false;
    break;
  case "development":
    global.__DEV__ = true;
    break;
  default:
    console.warn("Invalid NODE_ENV, default to dev environment");
    global.__DEV__ = true;
}
