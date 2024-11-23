import User from "../types/user.ts";
import fs from "fs/promises";
import db from "../../database.json" assert { type: "json" };

const pathToDB = "database.json";

export default async function putUser(update: User): Promise<User | null> {
  const userIndex = db.findIndex((user: User) => user.id === update.id);
  if (userIndex === -1) {
    return null;
  }
  const updateUser = { ...db[userIndex], ...update };
  db[userIndex] = updateUser;
  await fs.writeFile(pathToDB, JSON.stringify(db, null, 2), "utf-8");
  return updateUser;
}
