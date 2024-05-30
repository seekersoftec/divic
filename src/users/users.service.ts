import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { DatabaseService } from '@/database/database.service';
import { User } from './users.model';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  create(data: CreateUserInput): Promise<User> {
    return this.database.user.create({ data });
  }

  findAll(): Promise<User[]> {
    return this.database.user.findMany();
  }

  findOne(id: string): Promise<User> {
    return this.database.user.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateUserInput): Promise<User> {
    return this.database.user.update({
      where: { id: id },
      data,
    });
  }

  remove(id: string): Promise<User> {
    return this.database.user.delete({ where: { id } });
  }
}
