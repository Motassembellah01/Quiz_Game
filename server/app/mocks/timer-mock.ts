export const timerMock = jest.fn().mockReturnValue({
    startTimer: jest.fn(),
    clearTimer: jest.fn(),
    finishTimer: jest.fn(),
    initializeTimer: jest.fn(),
    activatePanic: jest.fn(),
});
