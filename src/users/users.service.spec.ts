import { Test, TestingModule } from '@nestjs/testing';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './users.model';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let service: UsersService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    biometricKey: 'biometricKey',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn((dto: CreateUserInput) => Promise.resolve(mockUser)),
    findAll: jest.fn(() => Promise.resolve([mockUser])),
    findOne: jest.fn((id: string) => Promise.resolve(mockUser)),
    update: jest.fn((id: string, dto: UpdateUserInput) =>
      Promise.resolve(mockUser),
    ),
    remove: jest.fn((id: string) => Promise.resolve(mockUser)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await resolver.createUser(createUserInput);
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserInput);
    });

    it('should handle errors during user creation', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new InternalServerErrorException());
      await expect(
        resolver.createUser({
          email: 'test@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await resolver.findAll();
      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should handle errors during fetching all users', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValueOnce(new InternalServerErrorException());
      await expect(resolver.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single user by ID', async () => {
      const result = await resolver.findOne('1');
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should handle user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);
      await expect(resolver.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during fetching a user by ID', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new InternalServerErrorException());
      await expect(resolver.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const updateUserInput: UpdateUserInput = {
        email: 'test@example.com',
        password: 'newPassword',
      };
      const result = await resolver.updateUser('1', updateUserInput);
      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserInput);
    });

    it('should handle user not found during update', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(null);
      await expect(
        resolver.updateUser('1', {
          email: 'test@example.com',
          password: 'newPassword',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during user update', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new InternalServerErrorException());
      await expect(
        resolver.updateUser('1', {
          email: 'test@example.com',
          password: 'newPassword',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('removeUser', () => {
    it('should remove a user by ID', async () => {
      const result = await resolver.removeUser('1');
      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should handle user not found during removal', async () => {
      jest.spyOn(service, 'remove').mockResolvedValueOnce(null);
      await expect(resolver.removeUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during user removal', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new InternalServerErrorException());
      await expect(resolver.removeUser('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
