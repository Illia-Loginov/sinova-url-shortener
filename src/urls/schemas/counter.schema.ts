import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ id: false, versionKey: false })
export class Counter {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: 0 })
  count: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
export type CounterDocument = HydratedDocument<Counter>;
