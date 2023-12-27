import { GameController } from '@app/controllers/game/game.controller';
import { ChatGateway } from '@app/gateways/chat.gateway';
import { GameGateway } from '@app/gateways/game.gateway';
import { TimerGateway } from '@app/gateways/timer.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { ValidationService } from '@app/services/validation/validation.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { LoginController } from './controllers/login/login.controller';
import { RecordController } from './controllers/record/record.controller';
import { CentralGateway } from './gateways/central.gateway';
import { RoomGateway } from './gateways/room.gateway';
import { Record, recordSchema } from './model/database/record';
import { ChatService } from './services/chat/chat.service';
import { GameStateService } from './services/game-state/game-state.service';
import { PlayerScoreStateService } from './services/player-score-state/player-score-state.service';
import { RecordService } from './services/record/record.service';
import { RoomManagerService } from './services/room-manager/room-manager.service';
import { RoomService } from './services/room/room.service';
import { TimerService } from './services/timer/timer.service';
import { ValidateAnswerService } from './services/validate-answer/validate-answer.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        // MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        MongooseModule.forFeature([{ name: Record.name, schema: recordSchema }]),

        EventEmitterModule.forRoot(),
    ],
    controllers: [GameController, LoginController, RecordController],
    providers: [
        GameService,
        ValidationService,
        Logger,
        RoomGateway,
        ChatGateway,
        ChatService,
        RoomManagerService,
        RoomService,
        GameGateway,
        TimerGateway,
        Logger,
        GameStateService,
        TimerService,
        PlayerScoreStateService,
        ValidateAnswerService,
        CentralGateway,
        RecordService,
    ],
})
export class AppModule {}
