import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Column extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ default: '#4ECDC4' })
  color?: string;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
