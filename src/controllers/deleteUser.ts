import db from "../../database.json" assert { type: "json" };
import fs from 'fs/promises';

const pathToFile= 'database.json';

export async function deleteUser(userId:string) {
    const usersWithoutDeleted = db.filter(user=>user.id!==userId);
    await fs.writeFile(pathToFile,JSON.stringify(usersWithoutDeleted,null,2), "utf-8");
    return usersWithoutDeleted;
}