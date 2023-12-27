import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthGameService {
    private isConnected = false;
    private isAccepted = false;

    setIsConnected(isConnected: boolean) {
        this.isConnected = isConnected;
    }

    getIsConnected(): boolean {
        return this.isConnected;
    }

    setIsAccepted(isAccepted: boolean) {
        this.isAccepted = isAccepted;
    }

    getIsAccepted(): boolean {
        return this.isAccepted;
    }

    resetAllValues() {
        this.isConnected = false;
        this.isAccepted = false;
    }
}
