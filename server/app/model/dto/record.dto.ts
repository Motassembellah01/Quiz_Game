import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RecordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    totalPlayer: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    bestScore: number;
}
