import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';
import { MAX_DURATION, MIN_DURATION, MIN_QUESTION } from './game-constants.dto';
export class CreateGameDto {
    @ApiProperty()
    @IsString({ message: "Le Id fourni n'est pas un string" })
    @IsOptional()
    id?: string;

    @ApiProperty()
    @IsString({ message: "Le titre fourni n'est pas de type string" })
    @IsNotEmpty({ message: 'Le titre ne devrait pas être vide' })
    title: string;

    @ApiProperty()
    @IsInt({ message: 'La duration devrait être un nombre entier' })
    @IsNotEmpty({ message: 'La duration ne devrait pas être vide' })
    @Min(MIN_DURATION, { message: 'La duration doit être de 10 secondes minimum' })
    @Max(MAX_DURATION, { message: 'La duration doit être de 60 secondes maximum' })
    duration: number;

    @ApiProperty()
    @IsString({ message: 'La date devrait être de type string' })
    @IsOptional()
    lastModification: string;

    @ApiProperty()
    @IsString({ message: 'La description devrait être un string' })
    @IsNotEmpty({ message: 'la description ne devrait pas être vide' })
    description: string;

    @ApiProperty()
    @IsBoolean({ message: 'la visibilité doit être un boolean' })
    @IsNotEmpty({ message: 'La visibilité ne devrait pas être vide' })
    visibility: boolean;

    @ApiProperty()
    @ArrayMinSize(MIN_QUESTION, { message: 'Le nombre minimum de question est de 1 pour un jeu valide' })
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];
}
