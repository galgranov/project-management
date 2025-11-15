import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from '../services/tasks.service';
import { Task } from '../schemas/task.schema';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks(): Promise<Task[]> {
    return this.tasksService.getAllTasks();
  }

  @Get('board/:boardId')
  async getTasksByBoardId(@Param('boardId') boardId: string): Promise<Task[]> {
    return this.tasksService.getTasksByBoardId(boardId);
  }

  @Get('column/:columnId')
  async getTasksByColumnId(@Param('columnId') columnId: string): Promise<Task[]> {
    return this.tasksService.getTasksByColumnId(columnId);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string): Promise<Task> {
    const task = await this.tasksService.getTaskById(id);
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return task;
  }

  @Post()
  async createTask(@Body() taskData: Partial<Task>): Promise<Task> {
    return this.tasksService.createTask(taskData);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() taskData: Partial<Task>
  ): Promise<Task> {
    const task = await this.tasksService.updateTask(id, taskData);
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return task;
  }

  @Put(':id/move')
  async moveTask(
    @Param('id') id: string,
    @Body() moveData: { columnId: string; order: number }
  ): Promise<Task> {
    const task = await this.tasksService.moveTask(id, moveData.columnId, moveData.order);
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return task;
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.tasksService.deleteTask(id);
    if (!deleted) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Task deleted successfully' };
  }
}
