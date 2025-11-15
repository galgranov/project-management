import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Board extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 'default-user' })
  ownerId: string;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
