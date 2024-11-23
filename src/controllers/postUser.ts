import User from "../types/user.ts";
import fs from "fs/promises";
import { v1 as uuidv1 } from "uuid";
import { getUser } from "./getUsers.ts";

const pathToUsers: string = "database.json";
export default async function postUser(
  username: string,
  age: number,
  hobbies: string[] | []
): Promise<User> {
  const fileData = await fs.readFile(pathToUsers, { encoding: "utf-8" });
  const users = JSON.parse(fileData);
  let newId: string;
  do {
    newId = uuidv1();
  } while (getUser(newId));

  const newUser: User = {
    id: uuidv1(),
    username,
    age,
    hobbies,
  };
  users.push(newUser);

  await fs.writeFile(pathToUsers, JSON.stringify(users, null, 2));
  return newUser;
}
