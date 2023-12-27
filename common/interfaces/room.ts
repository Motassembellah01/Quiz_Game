import { Player } from './player';

export interface Room {
    code: string;
    players?: Player[];
    banPlayersList?: Player[];
}
