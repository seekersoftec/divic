import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@/users/users.service';
import { DatabaseService } from '@/database/database.service';
import { CreateUserInput } from '@/users/dto/create-user.input';
import { UpdateUserInput } from '@/users/dto/update-user.input';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@/auth/enum/role.enum';
import { User } from '@prisma/client';
import { databaseServiceMock } from '@/mocks';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };

      const mockUser: User = {
        id: '1',
        email: createUserInput.email,
        password: 'hashedPassword',
        role: Role.USER,
        biometricKey: 'biometricKey',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      databaseServiceMock.user.findUnique.mockResolvedValue(null);
      databaseServiceMock.user.create.mockResolvedValue(mockUser);

      const result = await usersService.create(createUserInput);

      expect(result).toEqual(
        expect.objectContaining({ id: '1', email: createUserInput.email }),
      );
      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserInput.email },
      });
      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: createUserInput.email,
          password: expect.any(String),
        }),
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
        role: Role.USER,
      };

      const mockExistingUser: User = {
        id: '1',
        email: createUserInput.email,
        password: 'hashedPassword',
        role: Role.USER,
        biometricKey: 'biometricKey',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      databaseServiceMock.user.findUnique.mockResolvedValue(mockExistingUser);

      await expect(usersService.create(createUserInput)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if password is less than 8 characters', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'short',
        role: Role.USER,
      };

      await expect(usersService.create(createUserInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];

      databaseServiceMock.user.findMany.mockResolvedValue(mockUsers);
      const result = await usersService.findAll();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('findByID', () => {
    it('should return user by ID', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      databaseServiceMock.user.findUnique.mockResolvedValue(mockUser);
      const result = await usersService.findByID('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findByID('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      databaseServiceMock.user.findUnique.mockResolvedValue(mockUser);
      const result = await usersService.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(
        usersService.findByEmail('test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user and return updated user', async () => {
      const updateUserInput: UpdateUserInput = { email: 'updated@example.com' };
      const mockUser = { id: '1', ...updateUserInput };

      databaseServiceMock.user.update.mockResolvedValue(mockUser);

      const result = await usersService.update('1', updateUserInput);

      expect(result).toEqual(mockUser);
      expect(databaseServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserInput,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      databaseServiceMock.user.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        usersService.update('1', { email: 'updated@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user and return deleted user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };

      databaseServiceMock.user.findUnique.mockResolvedValue(mockUser);
      databaseServiceMock.user.delete.mockResolvedValue(mockUser);

      const result = await usersService.remove('1');

      expect(result).toEqual(mockUser);
      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(databaseServiceMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(usersService.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
