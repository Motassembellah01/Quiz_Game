import { Injectable } from '@angular/core';
import { Player } from '@common/interfaces/player';
import { ClientSocketService } from './client-socket.service';
import { GameEvent } from '@common/enum/game.gateway.events';
import { MINUS_ONE } from '@common/constantes/constantes';

@Injectable({
    providedIn: 'root',
})
export class SortPlayerService {
    playerScore: Player[] = [];
    isDirectionNameUp: boolean = false;
    isDirectionNameDown: boolean = false;

    isDirectionPointUp: boolean = false;
    isDirectionPointDown: boolean = false;

    isDirectionStateUp: boolean = false;
    isDirectionStateDown: boolean = false;
    constructor(private clientSocketService: ClientSocketService) {}

    sortByName(ascending: boolean, theList: Player[]) {
        theList.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            if (nameA < nameB) {
                return ascending ? MINUS_ONE : 1;
            }
            if (nameA > nameB) {
                return ascending ? 1 : MINUS_ONE;
            }
            return 0;
        });
        this.clientSocketService.send(GameEvent.SortPlayer, JSON.stringify(theList));
        return theList;
    }

    sortByPoint(ascending: boolean, theList: Player[]) {
        theList.sort((a, b) => {
            const scoreA = a.score;
            const scoreB = b.score;

            if (scoreA < scoreB) {
                return ascending ? 1 : MINUS_ONE;
            }
            if (scoreA > scoreB) {
                return ascending ? MINUS_ONE : 1;
            }
            return 0;
        });
        this.clientSocketService.send(GameEvent.SortPlayer, JSON.stringify(theList));
        return theList;
    }

    sortByState(ascending: boolean, theList: Player[]) {
        theList.sort((a, b) => {
            if (a.status === b.status) {
                if (a.interaction === b.interaction) {
                    if (a.submit === b.submit) {
                        return 0;
                    } else if (ascending) {
                        return a.submit ? MINUS_ONE : 1;
                    } else {
                        return a.submit ? 1 : MINUS_ONE;
                    }
                } else if (ascending) {
                    return a.interaction ? MINUS_ONE : 1;
                } else {
                    return a.interaction ? 1 : MINUS_ONE;
                }
            } else if (ascending) {
                return a.status ? MINUS_ONE : 1;
            } else {
                return a.status ? 1 : MINUS_ONE;
            }
        });
        this.clientSocketService.send(GameEvent.SortPlayer, JSON.stringify(theList));
        return theList;
    }

    resetAllDirection() {
        this.isDirectionNameUp = false;
        this.isDirectionNameDown = false;
        this.isDirectionPointUp = false;
        this.isDirectionPointDown = false;
        this.isDirectionStateUp = false;
        this.isDirectionStateDown = false;
    }

    toggleSort(type: string, direction: 'up' | 'down') {
        switch (type) {
            case 'Name':
                this.toggleName(direction);
                break;
            case 'Point':
                this.togglePoint(direction);
                break;
            case 'State':
                this.toggleState(direction);
                break;
        }
    }

    toggleName(direction: 'up' | 'down') {
        let temp = false;
        switch (direction) {
            case 'up': {
                temp = !this.isDirectionNameUp;
                this.resetAllDirection();
                this.isDirectionNameUp = temp;
                this.sortByName(true, this.playerScore);
                this.clientSocketService.send(GameEvent.TypeOfSort, ['Name', true]);
                break;
            }
            case 'down': {
                temp = !this.isDirectionNameDown;
                this.resetAllDirection();
                this.isDirectionNameDown = temp;
                this.sortByName(false, this.playerScore);
                this.clientSocketService.send(GameEvent.TypeOfSort, ['Name', false]);
                break;
            }
        }
    }

    togglePoint(direction: 'up' | 'down') {
        let temp = false;
        switch (direction) {
            case 'up': {
                temp = !this.isDirectionPointUp;
                this.resetAllDirection();
                this.isDirectionPointUp = temp;
                this.sortByPoint(true, this.playerScore);
                this.clientSocketService.send(GameEvent.TypeOfSort, ['Point', true]);
                break;
            }
            case 'down': {
                temp = !this.isDirectionPointDown;
                this.resetAllDirection();
                this.isDirectionPointDown = temp;
                this.sortByPoint(false, this.playerScore);
                this.clientSocketService.send(GameEvent.TypeOfSort, ['Point', false]);
                break;
            }
        }
    }

    toggleState(direction: 'up' | 'down') {
        let temp = false;
        switch (direction) {
            case 'up': {
                temp = !this.isDirectionStateUp;
                this.resetAllDirection();
                this.isDirectionStateUp = temp;
                this.sortByState(true, this.playerScore);
                this.clientSocketService.send(GameEvent.TypeOfSort, ['State', true]);
                break;
            }
            case 'down': {
                temp = !this.isDirectionStateDown;
                this.resetAllDirection();
                this.isDirectionStateDown = temp;
                this.sortByState(false, this.playerScore);
                this.clientSocketService.send(GameEvent.TypeOfSort, ['State', false]);
                break;
            }
        }
    }

    noSort() {
        this.clientSocketService.send(GameEvent.SortPlayer, JSON.stringify(this.playerScore));
        return this.playerScore;
    }

    decisionOfSort() {
        if (this.isDirectionNameUp) return this.sortByName(true, this.playerScore);
        else if (this.isDirectionNameDown) return this.sortByName(false, this.playerScore);
        else if (this.isDirectionPointUp) return this.sortByPoint(true, this.playerScore);
        else if (this.isDirectionPointDown) return this.sortByPoint(false, this.playerScore);
        else if (this.isDirectionStateUp) return this.sortByState(true, this.playerScore);
        else if (this.isDirectionStateDown) return this.sortByState(false, this.playerScore);
        else return this.noSort();
    }
}
