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
import { BoardsService } from '../services/boards.service';
import { Board } from '../schemas/board.schema';
import { Column } from '../schemas/column.schema';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  async getAllBoards(): Promise<Board[]> {
    return this.boardsService.getAllBoards();
  }

  @Get(':id')
  async getBoardById(@Param('id') id: string): Promise<Board> {
    const board = await this.boardsService.getBoardById(id);
    if (!board) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }
    return board;
  }

  @Post()
  async createBoard(@Body() boardData: Partial<Board>): Promise<Board> {
    return this.boardsService.createBoard(boardData);
  }

  @Put(':id')
  async updateBoard(
    @Param('id') id: string,
    @Body() boardData: Partial<Board>
  ): Promise<Board> {
    const board = await this.boardsService.updateBoard(id, boardData);
    if (!board) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }
    return board;
  }

  @Delete(':id')
  async deleteBoard(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.boardsService.deleteBoard(id);
    if (!deleted) {
      throw new HttpException('Board not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Board deleted successfully' };
  }

  // Column endpoints
  @Get(':boardId/columns')
  async getColumnsByBoardId(@Param('boardId') boardId: string): Promise<Column[]> {
    return this.boardsService.getColumnsByBoardId(boardId);
  }

  @Post(':boardId/columns')
  async createColumn(
    @Param('boardId') boardId: string,
    @Body() columnData: Partial<Column>
  ): Promise<Column> {
    return this.boardsService.createColumn({ ...columnData, boardId: boardId as any });
  }

  @Put('columns/:id')
  async updateColumn(
    @Param('id') id: string,
    @Body() columnData: Partial<Column>
  ): Promise<Column> {
    const column = await this.boardsService.updateColumn(id, columnData);
    if (!column) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
    return column;
  }

  @Delete('columns/:id')
  async deleteColumn(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.boardsService.deleteColumn(id);
    if (!deleted) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Column deleted successfully' };
  }
}
