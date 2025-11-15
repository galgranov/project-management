import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 'todo' })
  status: string;

  @Prop({ required: true, default: 'medium' })
  priority: string;

  @Prop({ type: Types.ObjectId, ref: 'Column', required: true })
  columnId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  order: number;

  @Prop({ required: false })
  owner?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
