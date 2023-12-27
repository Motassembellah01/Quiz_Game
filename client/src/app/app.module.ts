import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { QuizComponent } from '@app/pages/quiz-page/quiz-page.component';
import { NgChartsModule } from 'ng2-charts';
import { AdminCardComponent } from './components/admin-card/admin-card.component';
import { AuthComponent } from './components/auth/auth.component';
import { ChatComponent } from './components/chat/chat.component';
import { DisplayChoiceComponent } from './components/display-choice/display-choice.component';
import { DisplayGameComponent } from './components/display-game/display-game.component';
import { DisplayTimerComponent } from './components/display-timer/display-timer.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { GameAuthComponent } from './components/game-auth/game-auth.component';
import { GraphResultComponent } from './components/graph-result/graph-result.component';
import { ImportGameComponent } from './components/import-game/import-game.component';
import { OnlinePlayerBoardComponent } from './components/online-player-board/online-player-board.component';
import { OrganizerOptionComponent } from './components/organizer-option/organizer-option.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { QcmFormComponent } from './components/qcm-form/qcm-form.component';
import { QrlFormComponent } from './components/qrl-form/qrl-form.component';
import { QuizFormComponent } from './components/quiz-form/quiz-form.component';
import { RecordListComponent } from './components/record-list/record-list.component';
import { SideQuizListComponent } from './components/side-quiz-list/side-quiz-list.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SortPlayerComponent } from './components/sort-player/sort-player.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { WaitingBoardComponent } from './components/waiting-board/waiting-board.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { CreateQuizPageComponent } from './pages/create-quiz-page/create-quiz-page.component';
import { LobbyPageComponent } from './pages/lobby-page/lobby-page.component';
import { OrganisatorPageComponent } from './pages/organisator-page/organisator-page.component';
import { ResultPageComponent } from './pages/result-page/result-page.component';
import { EvaluationAreaComponent } from './components/evaluation-area/evaluation-area.component';
import { GradesOrganisateurComponent } from './components/grades-organisateur/grades-organisateur.component';
import { DialogComponent } from './components/dialog/dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        AdminPageComponent,
        AuthComponent,
        AdminCardComponent,
        SidenavComponent,
        CreateQuizPageComponent,
        QuizComponent,
        ImportGameComponent,
        ErrorMessageComponent,
        QrlFormComponent,
        QcmFormComponent,
        QuizFormComponent,
        SideQuizListComponent,
        OrganisatorPageComponent,
        PlayersListComponent,
        TopBarComponent,
        GraphResultComponent,
        DisplayTimerComponent,
        DisplayGameComponent,
        DisplayChoiceComponent,
        LobbyPageComponent,
        OnlinePlayerBoardComponent,
        WaitingBoardComponent,
        OrganizerOptionComponent,
        GameAuthComponent,
        ResultPageComponent,
        ChatComponent,
        RecordListComponent,
        SortPlayerComponent,
        EvaluationAreaComponent,
        GradesOrganisateurComponent,
        DialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        HttpClientModule,
        MatFormFieldModule,
        MatInputModule,
        DragDropModule,
        NgChartsModule,
        ClipboardModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
