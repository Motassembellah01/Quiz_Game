export enum TimerEvent {
    TimerTick = 'timerTick',
    TimerHit0 = 'timerHit0',
    TimerDone = 'timerDone',
    OrgChangeQuestion = 'orgChangeQuestion',
    WaitVerify = 'waitVerify',
}

export enum TimerState {
    Test = 'test',
    Transition5s = 'transition5s',
    TransitionQuestion = 'transitionQuestion',
    Attendre = 'attendre',
}
