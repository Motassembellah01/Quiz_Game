import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { CreateChoiceDto } from './create-choice.dto';
import { MAX_CHOIX, MAX_POINT, MIN_POINT } from './game-constants.dto';
export class CreateQuestionDto {
    @ApiProperty()
    @IsString({ message: 'Le type de la question devrait être un string' })
    @IsNotEmpty({ message: 'Le type de la question ne devrait pas être vide' })
    type: string;

    @ApiProperty()
    @IsString({ message: 'La question devrait être un string' })
    @IsNotEmpty({ message: 'La question ne devrait pas être vide' })
    text: string;

    @ApiProperty()
    @IsInt({ message: 'le nombre de points doit être un nombre entier' })
    @Min(MIN_POINT, { message: 'le nombre de points minimum est 10' })
    @Max(MAX_POINT, { message: 'le nombre de point maximum est 100' })
    @IsNotEmpty({ message: 'le nombre de point ne peut pas être vide' })
    points: number;

    @ApiProperty()
    @IsOptional()
    @ArrayMaxSize(MAX_CHOIX, { message: 'Il ne peux pas y avoir plus de 4 choix de réponse dans une question' })
    @ValidateNested({ each: true })
    @Type(() => CreateChoiceDto)
    choices?: CreateChoiceDto[];
}
