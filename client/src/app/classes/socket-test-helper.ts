/* eslint-disable */
/* tslint:disable */

type CallbackSignature = (params: any) => {};

export class SocketTestHelper {
    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }

        this.callbacks.get(event)!.push(callback);
    }

    emit(event: string, ...params: any): void {
        return;
    }

    disconnect(): void {
        return;
    }

    off(event: string) {
        return;
    }

    peerSideEmit(event: string, params?: any) {
        if (!this.callbacks.has(event)) {
            return;
        }

        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }

    private callbacks = new Map<string, CallbackSignature[]>();
}

// Ce code s'inpire de l'exemple Socket-IO fourni dans le cadre du cours par Nikolay Radoev - Chargé du cours LOG2990
