import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsController } from './controllers/boards.controller';
import { TasksController } from './controllers/tasks.controller';
import { UsersController } from './controllers/users.controller';
import { BoardsService } from './services/boards.service';
import { TasksService } from './services/tasks.service';
import { UsersService } from './services/users.service';
import { Board, BoardSchema } from './schemas/board.schema';
import { Column, ColumnSchema } from './schemas/column.schema';
import { Task, TaskSchema } from './schemas/task.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/project-management', {
      // Connection options can be added here if needed
    }),
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Column.name, schema: ColumnSchema },
      { name: Task.name, schema: TaskSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AppController, BoardsController, TasksController, UsersController],
  providers: [AppService, BoardsService, TasksService, UsersService],
})
export class AppModule {}
