import User from "../types/user.ts";
import db from "../../database.json" assert { type: "json" };

export function getUsers(): User[] {
  return db;
}

export function getUser(userId: string): User | void {
  const user = db.find((user: User) => user.id === userId);
  return user;
}


