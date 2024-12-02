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

  public async loadBD() {
    try {
      const data = await fs.readFile(pathToDB, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  }

  public async getUserById(userId: string) {
    const db = await this.loadBD();
    return db.find((user: User) => user.id === userId);
  }

  public async getUserIndex(userId: string) {
    const db = await this.loadBD();
    return db.findIndex((users: User) => users.id === userId);
  }

  public getUsers() {
    return this.loadBD();
  }

  public async deleteUser(userId: string) {
    const db = await this.loadBD();
    const usersWithoutDeleted = db.filter((user: User) => user.id !== userId);
    await this.saveDB(pathToDB, usersWithoutDeleted);
    return usersWithoutDeleted;
  }

  public async postUser(
    username: string,
    age: number,
    hobbies: string[] | []
  ): Promise<User> {
    const users = await this.getUsers();

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
    const db = await this.loadBD();
    const userIndex = await this.getUserIndex(updateData.id);
    if (userIndex === -1) {
      throw new Error("Can't find userIndex");
    }
    const updateUser = { ...db[userIndex], ...updateData };
    db[userIndex] = updateUser;
    await this.saveDB(pathToDB, db);
    return updateUser;
  }
}
