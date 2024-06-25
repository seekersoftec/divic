import { DatabaseService } from '@/database/database.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Session } from '../models/sessions.auth.model';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private database: DatabaseService) {}

  async create(
    userId: string,
    challenge: string,
    expireAt: Date,
  ): Promise<Session> {
    const existingUser = await this.database.session.findFirst({
      where: { userId },
    });

    if (existingUser && Date.now() < existingUser.expireAt.getTime()) {
      throw new UnauthorizedException(
        'User already has a pending registration',
      );
    }

    return this.database.session.create({
      data: {
        userId,
        challenge,
        expireAt,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    challenge: string,
    expireAt: Date | null,
  ): Promise<Session> {
    try {
      const key = await this.database.session.update({
        where: { id, userId, challenge },
        data: { expireAt },
      });

      if (!key) {
        throw new NotFoundException('Key not found');
      }

      return key;
    } catch (error) {
      this.logger.error(`Error updating key: ${error}`);
      throw new InternalServerErrorException(
        'Failed to update key, please try again later',
      );
    }
  }

  async delete(userId: string, challenge: string): Promise<boolean> {
    // we could also choose to delete by session id directly
    const deletedKey = await this.database.session.findFirst({
      where: { userId, challenge },
    });

    if (!deletedKey) {
      return false;
    }

    await this.database.session.delete({ where: { id: deletedKey.id } });
    return true;
  }

  async findByUserId(userId: string): Promise<Session> {
    // return this.database.session.findMany({
    //   where: { userId },
    // });
    return this.database.session.findFirst({
      where: { userId },
    });
  }

  async findByChallenge(challenge: string): Promise<Session> {
    return this.database.session.findFirst({
      where: { challenge },
    });
  }

  async findByUserIdAndChallenge(
    userId: string,
    challenge: string,
  ): Promise<Session> {
    return this.database.session.findFirst({
      where: { userId, challenge },
    });
  }
}
