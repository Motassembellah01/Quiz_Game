import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type RecordDocument = Record & Document;

@Schema()
export class Record {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    totalPlayer: number;

    @Prop({ required: true })
    bestScore: number;

    @Prop({ type: Number, select: false })
    // c'est l'attribut de mongoose je ne peux pas la nommer différamment!
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __v: number;
}

export const recordSchema = SchemaFactory.createForClass(Record);
