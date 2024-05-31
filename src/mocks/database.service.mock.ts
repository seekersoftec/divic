const databaseServiceMock = {
  user: {
    create: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: Date.now().toString(),
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),

    findUnique: jest.fn().mockImplementation((query) => {
      if (query.where.email === 'test@example.com') {
        return Promise.resolve({
          id: '1',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }),

    findMany: jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          id: '1',
          email: 'test1@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'test2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    ),

    update: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: dto.where.id,
        ...dto.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),

    delete: jest.fn().mockImplementation((dto) =>
      Promise.resolve({
        id: dto.where.id,
        email: 'deleted@example.com',
        password: 'deletedPassword',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
  },
};

export default databaseServiceMock;

// databaseServiceMock = mockDeep<DatabaseService>();
// databaseServiceMock =
//   mockDeep<DatabaseService>() as unknown as DeepMockProxy<{
//     [K in keyof DatabaseService]: Omit<DatabaseService[K], 'groupBy'>;
//   }>;

// let databaseServiceMock: DeepMockProxy<DatabaseService>;

// interface DatabaseServiceMock {
//   user: {
//     create: (dto: any) => Promise<User>; // Replace 'any' with actual DTO type
//     findUnique: (where?: any) => Promise<User | null>; // Replace 'any' with filter type
//     findMany: (filter?: any) => Promise<User[]>; // Replace 'any' with filter type (optional)
//     update: (where: any, data: any) => Promise<User>; // Replace 'any' with filter and data types
//     delete: (where: any) => Promise<User>; // Replace 'any' with filter type
//   };
// }

// databaseServiceMock = {
//   user: {
//     create: jest.fn().mockImplementation((dto) =>
//       Promise.resolve({
//         id: Date.now().toString(),
//         ...dto,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }),
//     ),
//     findUnique: jest.fn().mockResolvedValue(null),
//     findMany: jest.fn().mockResolvedValue([
//       {
//         id: '1',
//         email: 'test1@example.com',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//       {
//         id: '2',
//         email: 'test2@example.com',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       },
//     ]),
//     update: jest.fn().mockImplementation((dto) =>
//       Promise.resolve({
//         id: dto.where.id,
//         ...dto.data,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }),
//     ),
//     delete: jest.fn().mockResolvedValue({
//       id: '1',
//       email: 'deleted@example.com',
//       password: 'deletedPassword',
//       role: 'USER',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     }),
//   },
// };

// let databaseServiceMock: typeof databaseServiceMock;
