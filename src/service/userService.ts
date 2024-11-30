import User from "../types/user.ts";
import { UserRepository } from "../repository/userRepository.ts";

export class UserService {
  constructor(private userRepository: UserRepository) {}
  public async deleteUser(userId: string) {
    return await this.userRepository.deleteUser(userId);
  }

  public getUsers(): User[] {
    return this.userRepository.getUsers();
  }

  public getUserById(userId: string): User | void {
    const user = this.userRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  public async postUser(
    username: string,
    age: number,
    hobbies: string[] | []
  ): Promise<User> {
    return this.userRepository.postUser(username, age, hobbies);
  }

  public async putUser(updateData: User): Promise<User | null> {
    return await this.userRepository.putUser(updateData);
  }
}
