import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateQuizPageComponent } from '@app/pages/create-quiz-page/create-quiz-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { OrganisatorPageComponent } from '@app/pages/organisator-page/organisator-page.component';
import { QuizComponent } from '@app/pages/quiz-page/quiz-page.component';
import { ResultPageComponent } from '@app/pages/result-page/result-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'create-quiz', component: CreateQuizPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'Quiz/:mode', component: QuizComponent },
    { path: 'organisator-page', component: OrganisatorPageComponent },
    { path: 'result-page', component: ResultPageComponent },
    { path: 'lobby-page', component: LobbyPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
