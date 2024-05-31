import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { DatabaseService } from '@/database/database.service';
import { User } from './users.model';
import validator from 'validator';

/**
 * UsersService handles the logic for user management,
 * including creating, updating, finding, and deleting users.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly roundsOfHashing = 10;

  constructor(private readonly database: DatabaseService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.roundsOfHashing);
  }

  /**
   * Creates a new user with the given data.
   * The password is hashed before storing in the database.
   * @param data - The data for the new user.
   * @returns The created user with the password field removed.
   * @throws ConflictException if a user with the given email already exists.
   * @throws InternalServerErrorException for any other errors.
   */
  async create(data: CreateUserInput): Promise<User> {
    try {
      if (!validator.isLength(data.password, { min: 8 })) {
        throw new BadRequestException(
          'Password must be at least 8 characters long',
        );
      }

      const existingUser = await this.database.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      data.password = await this.hashPassword(data.password);
      const user = await this.database.user.create({ data });
      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to create user, please try again later',
        );
      }
    }
  }

  /**
   * Retrieves all users from the database.
   * @returns An array of users.
   */
  async findAll(): Promise<User[]> {
    return this.database.user.findMany();
  }

  /**
   * Retrieves a user by their unique ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user with the specified ID.
   * @throws NotFoundException if the user is not found.
   * @throws InternalServerErrorException for any other errors.
   */
  async findByID(id: string): Promise<User> {
    try {
      const user = await this.database.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to retrieve user, please try again later',
        );
      }
    }
  }

  /**
   * Retrieves a user by their email address.
   * @param email - The email of the user to retrieve.
   * @returns The user with the specified email.
   * @throws NotFoundException if the user is not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.database.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Updates a user's data by their unique ID.
   * @param id - The ID of the user to update.
   * @param data - The new data for the user.
   * @returns The updated user.
   * @throws NotFoundException if the user is not found.
   * @throws InternalServerErrorException for any other errors.
   */
  async update(id: string, data: UpdateUserInput): Promise<User> {
    try {
      const user = await this.database.user.update({
        where: { id },
        data,
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(`Error updating user: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to update user, please try again later',
        );
      }
    }
  }

  /**
   * Deletes a user by their unique ID.
   * @param id - The ID of the user to delete.
   * @returns The deleted user.
   * @throws NotFoundException if the user is not found.
   * @throws InternalServerErrorException for any other errors.
   */
  async remove(id: string): Promise<User> {
    try {
      const user = await this.database.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return await this.database.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user: ${error}`);
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to delete user, please try again later',
        );
      }
    }
  }
}
