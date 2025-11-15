import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board } from '../schemas/board.schema';
import { Column } from '../schemas/column.schema';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<Board>,
    @InjectModel(Column.name) private columnModel: Model<Column>
  ) {}

  // Boards
  async getAllBoards(): Promise<Board[]> {
    return this.boardModel.find().exec();
  }

  async getBoardById(id: string): Promise<Board | null> {
    return this.boardModel.findById(id).exec();
  }

  async createBoard(boardData: Partial<Board>): Promise<Board> {
    const newBoard = new this.boardModel({
      title: boardData.title || 'Untitled Board',
      description: boardData.description,
      ownerId: boardData.ownerId || 'default-user',
    });
    const savedBoard = await newBoard.save();

    // Create default columns
    await this.createColumn({ title: 'To Do', boardId: savedBoard._id as any, order: 0 });
    await this.createColumn({ title: 'In Progress', boardId: savedBoard._id as any, order: 1 });
    await this.createColumn({ title: 'Done', boardId: savedBoard._id as any, order: 2 });

    return savedBoard;
  }

  async updateBoard(id: string, boardData: Partial<Board>): Promise<Board | null> {
    return this.boardModel
      .findByIdAndUpdate(id, boardData, { new: true })
      .exec();
  }

  async deleteBoard(id: string): Promise<boolean> {
    const result = await this.boardModel.findByIdAndDelete(id).exec();
    // Also delete associated columns
    await this.columnModel.deleteMany({ boardId: id }).exec();
    return result !== null;
  }

  // Columns
  async getColumnsByBoardId(boardId: string): Promise<Column[]> {
    // Validate if boardId is a valid ObjectId
    if (!Types.ObjectId.isValid(boardId)) {
      return [];
    }
    return this.columnModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ order: 1 })
      .exec();
  }

  async createColumn(columnData: Partial<Column>): Promise<Column> {
    const newColumn = new this.columnModel({
      title: columnData.title || 'New Column',
      boardId: columnData.boardId,
      order: columnData.order || 0,
      color: columnData.color || '#4ECDC4',
    });
    return newColumn.save();
  }

  async updateColumn(id: string, columnData: Partial<Column>): Promise<Column | null> {
    return this.columnModel
      .findByIdAndUpdate(id, columnData, { new: true })
      .exec();
  }

  async deleteColumn(id: string): Promise<boolean> {
    const result = await this.columnModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
