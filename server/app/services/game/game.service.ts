import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { ValidationService } from '@app/services/validation/validation.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        private readonly validationService: ValidationService,
    ) {}

    async getAllGames(): Promise<Game[]> {
        // c'est l'attribut de mongoose je ne peux pas la nommer différamment!
        // eslint-disable-next-line @typescript-eslint/naming-convention
        return await this.gameModel.find({}, { __v: 0, _id: 0 });
    }

    async getAllVisibleGame(): Promise<Game[]> {
        return await this.gameModel.find({ visibility: true });
    }

    async gameExist(gameId: string): Promise<boolean> {
        const game = await this.gameModel.findOne({ id: gameId });
        if (game) {
            return true;
        }
        return false;
    }

    async addGame(game: CreateGameDto) {
        await this.gameModel.create(game);
    }

    async deleteGame(gameId: string): Promise<boolean> {
        const res = await this.gameModel.deleteOne({
            id: gameId,
        });
        return res.deletedCount > 0;
    }

    async updateVisibility(quizId: string): Promise<void> {
        return await this.gameModel.findOneAndUpdate({ id: quizId }, [{ $set: { visibility: { $not: '$visibility' } } }]);
    }

    async getAllGameTitles(): Promise<string[]> {
        return await this.gameModel.distinct('title');
    }

    async getTitle(titleToFind: string): Promise<boolean> {
        const titles = await this.getAllGameTitles();
        return await titles.includes(titleToFind);
    }

    async getAllGameId(): Promise<string[]> {
        return await this.gameModel.distinct('id');
    }

    async createGameFromFile(jsonObj: CreateGameDto) {
        if (await this.validateTitle(jsonObj)) {
            throw new HttpException("le titre du jeu n'est pas unique", HttpStatus.BAD_REQUEST);
        }
        if (!this.validationService.validateQuestions(jsonObj)) {
            throw new HttpException('questions invalides', HttpStatus.BAD_REQUEST);
        }
        if (!jsonObj.id) {
            jsonObj.id = this.validationService.generateRandomId();
        }

        jsonObj.lastModification = new Date().toISOString();

        await this.validateId(jsonObj);

        await this.gameModel.create(jsonObj);
    }

    async modifyGame(gameToUpdate: CreateGameDto, idGame: string) {
        await this.gameModel.findOneAndUpdate({ id: idGame }, gameToUpdate, { upsert: true });
    }

    async validateTitle(jsonObj: CreateGameDto): Promise<boolean> {
        const titles = await this.getAllGameTitles();
        return titles.includes(jsonObj.title);
    }

    async validateId(jsonObj: CreateGameDto) {
        const ids = await this.getAllGameId();
        const isExist = ids.includes(jsonObj.id);
        if (isExist) {
            while (ids.includes(jsonObj.id)) {
                jsonObj.id = this.validationService.generateRandomId();
            }
        }
    }
}
