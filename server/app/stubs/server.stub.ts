/* eslint-disable max-params */
// utiliser pour les tests.Le max params est nécessaire pour vérifier les events emit du server
import { SinonStub } from 'sinon';

export const serverStub = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub).withArgs(roomId).callsFake(() => {
        return {
            // utiliser pour les tests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emit: (event: string, data: any) => {
                expect(event).toEqual(eventExpected);
                expect(data).toEqual(JSON.stringify(res));
            },
        };
    });
};

export const serverStubNoStringify = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub).withArgs(roomId).callsFake(() => {
        return {
            // utiliser pour les tests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emit: (event: string, data: any) => {
                expect(event).toEqual(eventExpected);
                expect(data).toEqual(res);
            },
        };
    });
};

export const serverStubFirstCall = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onFirstCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string, data: any) => {
                    expect(event).toEqual(eventExpected);
                    expect(data).toEqual(JSON.stringify(res));
                },
            };
        });
};

export const serverStubCallWhitoutData = (server, roomId, eventExpected) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onFirstCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string) => {
                    expect(event).toEqual(eventExpected);
                },
            };
        });
};

export const serverStubSecondCall = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onSecondCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string, data: any) => {
                    expect(event).toEqual(eventExpected);
                    expect(data).toEqual(JSON.stringify(res));
                },
            };
        });
};

export const serverStubThirdCall = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onThirdCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string, data: any) => {
                    expect(event).toEqual(eventExpected);
                    expect(data).toEqual(JSON.stringify(res));
                },
            };
        });
};

export const serverStubFirstCallNoStringify = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onFirstCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string, data: any) => {
                    expect(event).toEqual(eventExpected);
                    expect(data).toEqual(res);
                },
            };
        });
};

export const serverStubSecondCallNoStringify = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onSecondCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string, data: any) => {
                    expect(event).toEqual(eventExpected);
                    expect(data).toEqual(res);
                },
            };
        });
};

export const serverStubCallNoStringify = (server, roomId, eventExpected, res) => {
    (server.to as SinonStub).withArgs(roomId).callsFake(() => {
        return {
            // utiliser pour les tests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emit: (event: string, data: any) => {
                expect(event).toEqual(eventExpected);
                expect(data).toEqual(res);
            },
        };
    });
};

export const serverStubWithoutRes = (server, roomId, eventExpected) => {
    (server.to as SinonStub).withArgs(roomId).callsFake(() => {
        return {
            // utiliser pour les tests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emit: (event: string) => {
                expect(event).toEqual(eventExpected);
            },
        };
    });
};

export const serverStubWithoutResAndArgs = (server, roomId, eventExpected) => {
    (server.to as SinonStub).callsFake(() => {
        return {
            // utiliser pour les tests
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emit: (event: string) => {
                expect(event).toEqual(eventExpected);
            },
        };
    });
};

export const serverStubFirstCallNoRes = (server, roomId, eventExpected) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onFirstCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string) => {
                    expect(event).toEqual(eventExpected);
                },
            };
        });
};
export const serverStubSecondCallNoRes = (server, roomId, eventExpected) => {
    (server.to as SinonStub)
        .withArgs(roomId)
        .onSecondCall()
        .callsFake(() => {
            return {
                // utiliser pour les tests
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                emit: (event: string) => {
                    expect(event).toEqual(eventExpected);
                },
            };
        });
};
