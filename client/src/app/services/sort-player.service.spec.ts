/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Player } from '@common/interfaces/player';
import { ClientSocketService } from './client-socket.service';
import { SortPlayerService } from './sort-player.service';
import { MINUS_ONE } from '@common/constantes/constantes';

let playerList: Player[] = [];

describe('SortPlayerService', () => {
    let service: SortPlayerService;
    let clientSocketServiceSpy: jasmine.SpyObj<ClientSocketService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ClientSocketService', ['send']);

        TestBed.configureTestingModule({
            providers: [SortPlayerService, { provide: ClientSocketService, useValue: spy }],
        });

        service = TestBed.inject(SortPlayerService);
        clientSocketServiceSpy = TestBed.inject(ClientSocketService) as jasmine.SpyObj<ClientSocketService>;
        playerList = [
            { name: 'a', score: 0, status: true, chat: true, interaction: false, submit: false },
            { name: 'a', score: 0, status: false, chat: true, interaction: true, submit: false },
            { name: 'b', score: 30, status: true, chat: true, interaction: true, submit: true },
            { name: 'd', score: 60, status: true, chat: true, interaction: false, submit: true },
            { name: 'c', score: 90, status: true, chat: true, interaction: true, submit: false },
            { name: 'e', score: 10, status: true, chat: true, interaction: true, submit: false },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should sort by name in ascending order', () => {
        const beforeSort1: Player = playerList[4];

        const result = service.sortByName(true, playerList);
        expect(result[3]).toEqual(beforeSort1);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(result));
    });

    it('should sort by name in descending order', () => {
        const beforeSort1: Player = playerList[4];

        const result = service.sortByName(false, playerList);
        expect(result[2]).toEqual(beforeSort1);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(result));
    });

    it('should sort by point in ascending order', () => {
        const beforeSort: Player = playerList[4];

        const result = service.sortByPoint(true, playerList);
        expect(result[0]).toEqual(beforeSort);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(result));
    });

    it('should sort by point in descending order', () => {
        const beforeSort: Player = playerList[4];

        const result = service.sortByPoint(false, playerList);
        expect(result[5]).toEqual(beforeSort);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(result));
    });

    it('should sort by state in ascending order', () => {
        const beforeSort: Player = playerList[4];

        const result = service.sortByState(true, playerList);
        expect(result[1]).toEqual(beforeSort);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(result));
    });

    it('should sort by state in descending order', () => {
        const beforeSort: Player = playerList[1];

        const result = service.sortByState(false, playerList);
        expect(result[0]).toEqual(beforeSort);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(result));
    });

    it('should reset all directions to false', () => {
        service.isDirectionNameUp = true;
        service.isDirectionNameDown = true;
        service.isDirectionPointUp = true;
        service.isDirectionPointDown = true;
        service.isDirectionStateUp = true;
        service.isDirectionStateDown = true;

        service.resetAllDirection();

        expect(service.isDirectionNameUp).toBeFalsy();
        expect(service.isDirectionNameDown).toBeFalsy();
        expect(service.isDirectionPointUp).toBeFalsy();
        expect(service.isDirectionPointDown).toBeFalsy();
        expect(service.isDirectionStateUp).toBeFalsy();
        expect(service.isDirectionStateDown).toBeFalsy();
    });

    it('should call toggleName', () => {
        const toggleNameSpy = spyOn(service, 'toggleName');
        service.toggleSort('Name', 'up');

        expect(toggleNameSpy).toHaveBeenCalledWith('up');

        service.toggleSort('Name', 'down');

        expect(toggleNameSpy).toHaveBeenCalledWith('down');
    });

    it('should call togglePoint', () => {
        const togglePointSpy = spyOn(service, 'togglePoint');
        service.toggleSort('Point', 'up');

        expect(togglePointSpy).toHaveBeenCalledWith('up');

        service.toggleSort('Point', 'down');

        expect(togglePointSpy).toHaveBeenCalledWith('down');
    });

    it('should call toggleState', () => {
        const toggleStateSpy = spyOn(service, 'toggleState');
        service.toggleSort('State', 'up');

        expect(toggleStateSpy).toHaveBeenCalledWith('up');

        service.toggleSort('State', 'down');

        expect(toggleStateSpy).toHaveBeenCalledWith('down');
    });

    it('should toggle name direction and trigger the correct sorting and socket communication', () => {
        // Arrange
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];
        service.isDirectionNameUp = false;
        service.isDirectionNameDown = false;

        // Act - Toggle Up
        service.toggleName('up');

        // Assert
        expect(service.isDirectionNameUp).toBe(true);
        expect(service.isDirectionNameDown).toBe(false);

        // Check if sorting and socket communication are triggered correctly
        const expectedAscendingList = [...originalList].sort((a, b) => a.name.localeCompare(b.name));
        expect(service.playerScore).toEqual(expectedAscendingList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedAscendingList));
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('TypeOfSort', ['Name', true]);

        // Act - Toggle Down
        service.toggleName('down');

        // Assert
        expect(service.isDirectionNameUp).toBe(false);
        expect(service.isDirectionNameDown).toBe(true);

        // Check if sorting and socket communication are triggered correctly
        const expectedDescendingList = [...originalList].sort((a, b) => b.name.localeCompare(a.name));
        expect(service.playerScore).toEqual(expectedDescendingList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedDescendingList));
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('TypeOfSort', ['Name', false]);
    });

    it('should toggle point direction and trigger the correct sorting and socket communication', () => {
        // Arrange
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];
        service.isDirectionPointUp = false;
        service.isDirectionPointDown = false;

        // Act - Toggle Up
        service.togglePoint('up');

        // Assert
        expect(service.isDirectionPointUp).toBe(true);
        expect(service.isDirectionPointDown).toBe(false);

        // Check if sorting and socket communication are triggered correctly
        const expectedAscendingList = [
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
        ];
        expect(service.playerScore).toEqual(expectedAscendingList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedAscendingList));
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('TypeOfSort', ['Point', true]);

        // Act - Toggle Down
        service.togglePoint('down');

        // Assert
        expect(service.isDirectionPointUp).toBe(false);
        expect(service.isDirectionPointDown).toBe(true);

        // Check if sorting and socket communication are triggered correctly
        const expectedDescendingList = [
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];
        expect(service.playerScore).toEqual(expectedDescendingList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedDescendingList));
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('TypeOfSort', ['Point', false]);
    });

    it('should toggle state direction and trigger the correct sorting and socket communication', () => {
        // Arrange
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];
        service.isDirectionStateUp = false;
        service.isDirectionStateDown = false;

        // Act - Toggle Up
        service.toggleState('up');

        // Assert
        expect(service.isDirectionStateUp).toBe(true);
        expect(service.isDirectionStateDown).toBe(false);

        // Check if sorting and socket communication are triggered correctly
        const expectedAscendingList = [
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
        ];
        expect(service.playerScore).toEqual(expectedAscendingList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedAscendingList));
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('TypeOfSort', ['State', true]);

        // Act - Toggle Down
        service.toggleState('down');

        // Assert
        expect(service.isDirectionStateUp).toBe(false);
        expect(service.isDirectionStateDown).toBe(true);

        // Check if sorting and socket communication are triggered correctly
        const expectedDescendingList = [...originalList].sort((a, b) => {
            if (a.status === b.status) {
                return a.interaction === b.interaction ? 0 : a.interaction ? 1 : MINUS_ONE;
            }
            return a.status ? 1 : MINUS_ONE;
        });
        expect(service.playerScore).toEqual(expectedDescendingList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedDescendingList));
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('TypeOfSort', ['State', false]);
    });

    it('should send SortPlayer event with sorted playerScore and return the sorted array for noSort()', () => {
        // Arrange
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];

        // Act
        const result = service.noSort();

        // Assert
        expect(result).toEqual(originalList);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(originalList));
    });

    it('should execute the Name sorting method based on active direction and send SortPlayer event for decisionOfSort()', () => {
        // Arrange
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];
        service.isDirectionNameUp = true;
        let result = service.decisionOfSort();
        let expectedSortedArray = [...originalList].sort((a, b) => a.name.localeCompare(b.name));
        expect(result).toEqual(expectedSortedArray);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedSortedArray));

        service.resetAllDirection();
        service.isDirectionNameDown = true;
        result = service.decisionOfSort();
        expectedSortedArray = [...originalList].sort((a, b) => b.name.localeCompare(a.name));
        expect(result).toEqual(expectedSortedArray);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedSortedArray));
    });

    it('should execute the Point sorting method based on active direction and send SortPlayer event for decisionOfSort()', () => {
        // Arrange
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        const sortedListUp: Player[] = [
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
        ];

        const sortedListDown: Player[] = [
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];
        service.isDirectionPointUp = true;
        let result = service.decisionOfSort();
        let expectedSortedArray = sortedListUp;
        expect(result).toEqual(expectedSortedArray);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedSortedArray));

        service.resetAllDirection();
        service.isDirectionPointDown = true;
        result = service.decisionOfSort();
        expectedSortedArray = sortedListDown;
        expect(result).toEqual(expectedSortedArray);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedSortedArray));
    });

    it('should execute the State sorting method based on active direction and send SortPlayer event for decisionOfSort()', () => {
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        const sortedListUp: Player[] = [
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
        ];

        const sortedListDown: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        service.playerScore = [...originalList];
        service.isDirectionStateUp = true;
        let result = service.decisionOfSort();
        let expectedSortedArray = sortedListUp;
        expect(result).toEqual(expectedSortedArray);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedSortedArray));

        service.resetAllDirection();
        service.isDirectionStateDown = true;
        result = service.decisionOfSort();
        expectedSortedArray = sortedListDown;
        expect(result).toEqual(expectedSortedArray);
        expect(clientSocketServiceSpy.send).toHaveBeenCalledWith('SortPlayer', JSON.stringify(expectedSortedArray));
    });

    it('should execute the no sorting method based on active direction and send SortPlayer event for decisionOfSort()', () => {
        const originalList: Player[] = [
            { name: 'John', score: 50, status: true, chat: true, interaction: false, submit: false },
            { name: 'Alice', score: 30, status: true, chat: true, interaction: true, submit: false },
            { name: 'Bob', score: 70, status: true, chat: true, interaction: true, submit: true },
        ];

        const noSortSpy = spyOn(service, 'noSort');

        service.playerScore = originalList;
        service.resetAllDirection();
        service.decisionOfSort();
        expect(noSortSpy).toHaveBeenCalled();
    });
});
