import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document } from 'mongoose';

export type ChoiceDocument = Choice & Document;

@Schema()
export class Choice {
    @ApiProperty()
    @Prop({ required: true })
    text: string;

    @ApiProperty()
    @Prop({ required: true })
    isCorrect: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, select: false })
    _id: mongoose.Types.ObjectId;

    @Prop({ type: Number, select: false })
    // c'est l'attribut de mongoose je ne peux pas la nommer différamment!
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __v: number;
}

export const choiceSchema = SchemaFactory.createForClass(Choice);
