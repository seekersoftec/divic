import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { DatabaseService } from '@/database/database.service';

@Module({
  providers: [UsersResolver, UsersService, DatabaseService],
})
export class UsersModule {}
