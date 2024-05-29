import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
@Module({
  imports: [
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    // UsersModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
