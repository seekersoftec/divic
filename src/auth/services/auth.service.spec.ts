import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/auth/services/auth.service';
import { UsersService } from '@/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SessionsService } from '@/auth/services/sessions.auth.service';
import { AuthRegisterInput } from '@/auth/dto/auth-request';
import { Role } from '@/auth/enum/role.enum';
import { databaseServiceMock } from '@/mocks';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { CreateUserInput } from '@/users/dto/create-user.input';

class MockJwtService extends JwtService {
  sign(payload: any, options?: any): string {
    return payload; // Or implement your custom logic
  }
}
const jwtServiceMock: MockJwtService = new MockJwtService();

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let sessionsService: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        // JwtService,
        SessionsService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: DatabaseService, useValue: databaseServiceMock },
      ],
      imports: [
        JwtModule.register({
          secretOrPrivateKey: 'jwt_secret_key',
        }),
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    sessionsService = module.get<SessionsService>(SessionsService);

    // Mock the userService method
    jest
      .spyOn(usersService, 'findByEmail')
      .mockImplementation(async (email: string) => {
        if (email === 'user@example.com') {
          const user: User = {
            id: '123',
            email: 'user@example.com',
            biometricKey: '',
            password: await bcrypt.hash('password', 10), // Hash the password
            role: 'USER',
            createdAt: new Date('2023-10-14T22:11:20+0000'),
            updatedAt: new Date('2023-10-14T22:11:20+0000'),
          };
          return user;
        } else if (email === 'non-existent@example.com') {
          return null;
        } else {
          throw new Error('Unexpected email in test');
        }
      });

    // Mock the bcrypt.compare method
    // jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    // jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(Promise.resolve(true));
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(
        async (data: string | Buffer, saltOrRounds: string | number) => {
          //   const salt = '$2b$10$fixed-salt-value';
          //   const hash = bcrypt.hash(data, salt);
          //   return hash;
          return 'hashedPassword';
        },
      );

    // Mock the jwtService.sign method
    // jest.spyOn(jwtService, 'sign').mockReturnValueOnce('accessToken');
    // jest.spyOn(jwtService, 'sign').mockReturnValueOnce('refreshToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  //   describe('register', () => {
  // it('should register a new user and return auth tokens', async () => {
  //   const userInput: AuthRegisterInput = {
  //     email: 'user@example.com',
  //     password: 'password123',
  //     withBiometric: false,
  //   };

  //   const mockUser = {
  //     id: expect.any(String),
  //     data: {
  //       email: userInput.email,
  //       password: 'hashedPassword',
  //       role: Role.USER,
  //     },
  //     createdAt: expect.any(Date),
  //     updatedAt: expect.any(Date),
  //   };

  //   const mockTokens = {
  //     accessToken: {
  //       email: userInput.email,
  //       role: Role.USER,
  //       sub: expect.any(String),
  //     },
  //     refreshToken: {
  //       accessToken: {
  //         email: userInput.email,
  //         role: Role.USER,
  //         sub: expect.any(String),
  //       },
  //       payload: {
  //         email: userInput.email,
  //         role: Role.USER,
  //         sub: expect.any(String),
  //       },
  //     },
  //   };

  //   // usersService.create.mockResolvedValue(mockUser);
  //   //   jwtService.sign
  //   //     .mockReturnValueOnce(mockTokens.accessToken)
  //   //     .mockReturnValueOnce(mockTokens.refreshToken);

  //   const result = await authService.register(userInput);
  //   console.log(result);

  //   expect(result.user).toEqual(mockUser);
  //   expect(result.accessToken).toEqual(mockTokens.accessToken);
  //   expect(result.refreshToken).toEqual(mockTokens.refreshToken);
  // });

  // it('should register a new user with biometric and return auth tokens', async () => {
  //   const userInput: AuthRegisterInput = {
  //     email: 'test@example.com',
  //     password: 'password123',
  //     withBiometric: true,
  //   };
  //   const mockUser: CreateUserInput = {
  //     // id: '1',
  //     email: userInput.email,
  //     role: Role.USER,
  //     password: userInput.password,
  //   };
  //   const mockTokens = {
  //     accessToken: 'access-token',
  //     refreshToken: 'refresh-token',
  //   };
  //   const mockSession = {
  //     userId: '1',
  //     challenge: 'challenge',
  //     expireAt: new Date(),
  //   };

  //   usersService.create.mockResolvedValue(mockUser);
  //   jwtService.sign
  //     .mockReturnValueOnce(mockTokens.accessToken)
  //     .mockReturnValueOnce(mockTokens.refreshToken);
  //   sessionsService.create.mockResolvedValue(
  //     mockSession.userId,
  //     mockSession.challenge,
  //     mockSession.expireAt,
  //   );

  //   const result = await authService.register(userInput);

  //   expect(result.user).toEqual(mockUser);
  //   expect(result.accessToken).toEqual(mockTokens.accessToken);
  //   expect(result.refreshToken).toEqual(mockTokens.refreshToken);
  //   expect(result.challenge).toEqual(mockSession.challenge);
  // });
  //   });

  describe('loginWithPassword', () => {
    it('should authenticate user and return auth tokens', async () => {
      const email = 'user@example.com';
      const password = 'password123';
      const mockUser: User = {
        id: '123',
        email,
        password: 'hashedPassword',
        biometricKey: '',
        role: Role.USER,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      const mockTokens = {
        accessToken: { email: email, role: Role.USER, sub: mockUser.id },
        refreshToken: {
          accessToken: {
            email: email,
            role: Role.USER,
            sub: mockUser.id,
          },
          payload: {
            email: email,
            role: Role.USER,
            sub: mockUser.id,
          },
        },
      };

      //   usersService.findByEmail.mockResolvedValue(mockUser.email);
      authService['comparePasswords'] = jest.fn().mockResolvedValue(true);

      const result = await authService.loginWithPassword(email, password);

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toEqual(mockTokens.accessToken);
      expect(result.refreshToken).toEqual(mockTokens.refreshToken);
    });

    // it('should throw UnauthorizedException for invalid credentials', async () => {
    //   const email = 'test@example.com';
    //   const password = 'wrongpassword';

    //   //   usersService.findByEmail.mockResolvedValue(null);

    //   await expect(
    //     authService.loginWithPassword(email, password),
    //   ).rejects.toThrow(UnauthorizedException);
    // });
  });

  //   describe('biometricLogin', () => {
  //     it('should authenticate user using biometric key and return auth tokens', async () => {
  //       const email = 'test@example.com';
  //       const challenge = '';
  //       const signedChallenge = 'signedChallenge';
  //       const mockUser = {
  //         id: '1',
  //         email,
  //         role: Role.USER,
  //         biometricKey: 'biometricKey',
  //       };
  //       const mockTokens = {
  //         accessToken: 'access-token',
  //         refreshToken: 'refresh-token',
  //       };

  //       usersService.findByEmail.mockResolvedValue(mockUser);
  //       authService['verifyBiometricKey'] = jest.fn().mockResolvedValue(true);
  //       jwtService.sign
  //         .mockReturnValueOnce(mockTokens.accessToken)
  //         .mockReturnValueOnce(mockTokens.refreshToken);

  //       const result = await authService.biometricLogin(
  //         email,
  //         challenge,
  //         signedChallenge,
  //       );

  //       expect(result.user).toEqual(mockUser);
  //       expect(result.accessToken).toEqual(mockTokens.accessToken);
  //       expect(result.refreshToken).toEqual(mockTokens.refreshToken);
  //     });

  //     it('should throw UnauthorizedException for invalid biometric key', async () => {
  //       const email = 'test@example.com';
  //       const challenge = '';
  //       const signedChallenge = 'invalidSignedChallenge';
  //       const mockUser = {
  //         id: '1',
  //         email,
  //         role: Role.USER,
  //         biometricKey: 'biometricKey',
  //       };

  //       usersService.findByEmail.mockResolvedValue(mockUser);
  //       authService['verifyBiometricKey'] = jest.fn().mockResolvedValue(false);

  //       await expect(
  //         authService.biometricLogin(email, challenge, signedChallenge),
  //       ).rejects.toThrow(UnauthorizedException);
  //     });
  //   });

  //   describe('completeBiometricRegistration', () => {
  //     it('should complete biometric registration', async () => {
  //       const userId = '1';
  //       const biometricKey = 'biometricKey';
  //       const signedChallenge = 'signedChallenge';
  //       const mockSession = {
  //         userId,
  //         challenge: 'challenge',
  //         expireAt: new Date(Date.now() + 10000),
  //       };
  //       const mockUser = {
  //         id: userId,
  //         email: 'test@example.com',
  //         role: Role.USER,
  //         biometricKey,
  //       };

  //       sessionsService.findByUserId.mockResolvedValue(mockSession);
  //       authService['verifyBiometricKey'] = jest.fn().mockResolvedValue(true);
  //       usersService.update.mockResolvedValue(mockUser);
  //       sessionsService.delete.mockResolvedValue(true);

  //       const result = await authService.completeBiometricRegistration(
  //         userId,
  //         biometricKey,
  //         signedChallenge,
  //       );

  //       expect(result).toBe(true);
  //     });

  //     it('should throw NotFoundException if session not found', async () => {
  //       const userId = '1';
  //       const biometricKey = 'biometricKey';
  //       const signedChallenge = 'signedChallenge';

  //       sessionsService.findByUserId.mockResolvedValue(null);

  //       await expect(
  //         authService.completeBiometricRegistration(
  //           userId,
  //           biometricKey,
  //           signedChallenge,
  //         ),
  //       ).rejects.toThrow(NotFoundException);
  //     });
  //   });
});
