import { LoginDto } from '@app/model/dto/login.dto';
import { PASSWORD } from '@common/constantes/constantes';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('login')
export class LoginController {
    @Post('/')
    async verifyLogin(@Body() loginInfo: LoginDto, @Res() response: Response) {
        try {
            if (loginInfo.password === PASSWORD) {
                response.status(HttpStatus.OK).send(true);
                return;
            }
            response.status(HttpStatus.OK).send(false);
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
