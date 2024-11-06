import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { z } from 'zod';
import { Counter } from './counter.schema';

@Schema({ id: false, versionKey: false })
export class Url {
  @Prop({
    required: true,
    unique: true,
    maxlength: 2000,
    validate: {
      validator: (value: string) => z.string().url().safeParse(value).success,
      message: 'Invalid URL',
    },
  })
  url: string;

  @Prop({ unique: true, minlength: 1, maxlength: 6, match: /^[a-z0-9]{1,6}$/ })
  code: string;

  @Prop({ default: 0 })
  clickCount: number;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
export type UrlDocument = HydratedDocument<Url>;

export const registerHooks = (counterModel: Model<Counter>) => {
  const schema = UrlSchema;

  schema.pre('save', async function (next) {
    if (this.isNew) {
      const urlCodeCounter = await counterModel.findOneAndUpdate(
        { name: 'urlCodeCounter' },
        { $inc: { count: 1 } },
        { new: true, upsert: true },
      );

      this.code = urlCodeCounter.count.toString(36);
    }

    next();
  });

  return schema;
};
