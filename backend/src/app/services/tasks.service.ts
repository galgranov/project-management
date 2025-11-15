import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>
  ) {}

  async getAllTasks(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async getTasksByBoardId(boardId: string): Promise<Task[]> {
    return this.taskModel.find({ boardId }).exec();
  }

  async getTasksByColumnId(columnId: string): Promise<Task[]> {
    return this.taskModel.find({ columnId }).exec();
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const tasksCount = await this.taskModel.countDocuments({ columnId: taskData.columnId });
    
    const newTask = new this.taskModel({
      title: taskData.title || 'New Task',
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      columnId: taskData.columnId,
      boardId: taskData.boardId,
      order: taskData.order !== undefined ? taskData.order : tasksCount + 1,
      owner: taskData.owner,
    });
    return newTask.save();
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
    return this.taskModel
      .findByIdAndUpdate(id, taskData, { new: true })
      .exec();
  }

  async moveTask(id: string, columnId: string, order: number): Promise<Task | null> {
    return this.taskModel
      .findByIdAndUpdate(id, { columnId, order }, { new: true })
      .exec();
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
