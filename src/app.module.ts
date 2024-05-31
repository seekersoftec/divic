import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DatabaseModule } from '@/database/database.module';
import { DatabaseService } from '@/database/database.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    DatabaseModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      }),
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        GRAPHQL_PLAYGROUND: Joi.number(),
        // ...
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
