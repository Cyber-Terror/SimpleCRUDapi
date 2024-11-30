import db from "../../database.json" assert { type: "json" };
import { pathToDB } from "../global.ts";
import fs from "fs/promises";
import User from "../types/user.ts";
import { v1 as uuidv1 } from "uuid";

export class UserRepository {
  public async saveDB(pathToDB: string, users: User[]) {
    try {
      await fs.writeFile(pathToDB, JSON.stringify(users, null, 2), "utf-8");
    } catch (error) {
      console.error(error);
    }
  }

  public getUserById(userId: string) {
    return db.find((user:User) => user.id === userId);
  }

  public getUserIndex(userId: string) {
    return db.findIndex((users:User ) => users.id === userId);
  }

  public getUsers() {
    return db;
  }

  public async deleteUser(userId: string) {
    const usersWithoutDeleted = db.filter((user:User) => user.id !== userId);
    await this.saveDB(pathToDB, usersWithoutDeleted);
    return usersWithoutDeleted;
  }

  public async postUser(
    username: string,
    age: number,
    hobbies: string[] | []
  ): Promise<User> {
    const users:User[] = this.getUsers();

    const newUser: User = {
      id: uuidv1(),
      username,
      age,
      hobbies,
    };
    users.push(newUser);

    await this.saveDB(pathToDB, users);
    return newUser;
  }

  public async putUser(updateData: User): Promise<User | null> {
    const db = (await import("../../database.json")).default as User[];
    const userIndex = this.getUserIndex(updateData.id);
    if (userIndex === -1) {
      throw new Error("Can't find userIndex");
    }
    const updateUser = { ...db[userIndex], ...updateData };
    db[userIndex] = updateUser;
    await this.saveDB(pathToDB, db);
    return updateUser;
  }
}
