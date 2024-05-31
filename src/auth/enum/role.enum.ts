import { registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

// export enum Role {
//   USER = 'USER',
//   ADMIN = 'ADMIN',
// }

export { Role };

registerEnumType(Role, {
  name: 'Role',
});
