import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './users.model';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '@/auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/auth/enum/role.enum';

/**
 * UsersResolver provides GraphQL resolver methods for user operations,
 * including creating, updating, finding, and deleting users.
 */
@Resolver(() => User)
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Mutation to create a new user.
   * @param createUserInput - The input data for creating a new user.
   * @returns The created user.
   */
  @Mutation(() => User)
  @Roles(Role.USER, Role.ADMIN)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  /**
   * Query to retrieve all users.
   * @returns An array of users.
   */
  @Query(() => [User], { name: 'users' })
  @Roles(Role.USER, Role.ADMIN)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * Query to retrieve a single user by their unique ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user with the specified ID.
   */
  @Query(() => User, { name: 'user' })
  @Roles(Role.USER, Role.ADMIN)
  async findOne(@Args('id', { type: () => String }) id: string): Promise<User> {
    return this.usersService.findByID(id);
  }

  /**
   * Mutation to update an existing user.
   * @param id - The ID of the user to update.
   * @param updateUserInput - The new data for the user.
   * @returns The updated user, or throws an error if update fails.
   */
  @Mutation(() => User, { nullable: true })
  @Roles(Role.ADMIN)
  async updateUser(
    @Args('id', { type: () => String }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, updateUserInput);
  }

  /**
   * Mutation to remove a user by their unique ID.
   * @param id - The ID of the user to remove.
   * @returns The removed user.
   */
  @Mutation(() => User)
  @Roles(Role.USER, Role.ADMIN)
  async removeUser(
    @Args('id', { type: () => String }) id: string,
  ): Promise<User> {
    return this.usersService.remove(id);
  }
}
