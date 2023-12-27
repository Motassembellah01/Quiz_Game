import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';
import { Choice, choiceSchema } from './choice';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @ApiProperty()
    @Prop({ required: true })
    type: string;

    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    @Prop({ type: [choiceSchema] })
    choices?: Choice[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, select: false })
    _id: mongoose.Types.ObjectId;

    @Prop({ type: Number, select: false })
    // c'est l'attribut de mongoose je ne peux pas la nommer différamment!
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __v: number;
}

export const questionSchema = SchemaFactory.createForClass(Question);
