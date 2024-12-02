import User from "../types/user.ts";
import { UserRepository } from "../repository/userRepository.ts";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }
  public async deleteUser(userId: string) {
    return await this.userRepository.deleteUser(userId);
  }

  public async getUsers() {
    return await this.userRepository.getUsers();
  }

  public async getUserById(userId: string): Promise<User | void> {
    const user = await this.userRepository.getUserById(userId);
    if (user == undefined) {
      throw new Error("User with this ID doesn't exists");
    }
    return user;
  }

  public async postUser(
    username: string,
    age: number,
    hobbies: string[] | []
  ): Promise<User> {
    return await this.userRepository.postUser(username, age, hobbies);
  }

  public async putUser(updateData: User): Promise<User | null> {
    return await this.userRepository.putUser(updateData);
  }
}
