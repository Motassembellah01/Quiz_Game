import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChoiceDto {
    @ApiProperty()
    @IsString({ message: 'le text du choix devrait être un string' })
    @IsNotEmpty({ message: 'le choix ne peut pas avoir un texte vide' })
    text: string;

    @ApiProperty()
    @IsBoolean({ message: 'la réponse du choix doit être un boolean' })
    @IsOptional()
    isCorrect?: boolean | null | undefined;
}
