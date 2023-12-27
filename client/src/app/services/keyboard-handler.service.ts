import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class KeyboardHandlerService {
    handleKeyPress(event: KeyboardEvent) {
        const key = event.key;

        if (key === '1' || key === '2' || key === '3' || key === '4') {
            const numericValue = parseInt(key, 10);
            return numericValue;
        } else if (key === 'Enter') {
            const enterKeyValue = 13;
            return enterKeyValue;
        }

        return null;
    }
}
