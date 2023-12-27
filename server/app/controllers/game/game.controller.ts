import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('/')
    async getAllQuiz(@Res() response: Response) {
        try {
            const games = await this.gameService.getAllGames();
            response.status(HttpStatus.OK).json(games);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/exist:id')
    async isGameExist(@Res() response: Response, @Param('id') id: string) {
        try {
            const isPresent = await this.gameService.gameExist(id);
            response.status(HttpStatus.OK).json(isPresent);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/visibility')
    async getAllVisibleGames(@Res() response: Response) {
        try {
            const visibleGames = await this.gameService.getAllVisibleGame();
            response.status(HttpStatus.OK).json(visibleGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/title:name')
    async getTitleUnique(@Param('name') name: string, @Res() response: Response) {
        try {
            const isUnique = await this.gameService.getTitle(name);
            response.status(HttpStatus.OK).json(isUnique);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            const deleted = await this.gameService.deleteGame(id);
            if (deleted) {
                response.status(HttpStatus.NO_CONTENT).send();
            } else {
                response.status(HttpStatus.NOT_FOUND).send({ message: 'Le jeu a déja été delete par un autre admin' });
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message });
        }
    }

    @Patch('/visibility/:id')
    async updateVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.updateVisibility(id);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Put('/modify/:id')
    async modifyGame(@Body() gameToModify: CreateGameDto, @Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.modifyGame(gameToModify, id);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Put('/')
    async addGame(@Body() createGameDto: CreateGameDto, @Res() response: Response) {
        try {
            await this.gameService.addGame(createGameDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @Post('/file')
    async createGameFromFile(@Body() createGameDto: CreateGameDto, @Res() response: Response) {
        try {
            await this.gameService.createGameFromFile(createGameDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send({ message: [error.message] });
        }
    }
}
