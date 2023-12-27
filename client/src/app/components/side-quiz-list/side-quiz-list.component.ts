import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Quiz } from '@common/interfaces/quiz';

@Component({
    selector: 'app-side-quiz-list',
    templateUrl: './side-quiz-list.component.html',
    styleUrls: ['./side-quiz-list.component.scss'],
})
export class SideQuizListComponent {
    @Input() quiz: Quiz;
    @Output() modifiedIndex = new EventEmitter<number>();

    modifyQuestion(index: number): void {
        this.modifiedIndex.emit(index);
    }

    changeOrderQuestion(index: number, direction: string): void {
        if (this.quiz.questions) {
            if (direction === 'up' && index !== 0) {
                const questionTemp = this.quiz.questions[index - 1];
                this.quiz.questions[index - 1] = this.quiz.questions[index];
                this.quiz.questions[index] = questionTemp;
            } else if (direction === 'down' && index <= this.quiz.questions.length - 2) {
                const questionTemp = this.quiz.questions[index + 1];
                this.quiz.questions[index + 1] = this.quiz.questions[index];
                this.quiz.questions[index] = questionTemp;
            }
        }
    }
}
