/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { QuizService } from '@app/services/quiz.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function validateTitle(quizService: QuizService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const title = control.value;

        return quizService.getTitleUnique(title).pipe(
            map((isNotUnique: boolean) => {
                return isNotUnique ? { titleNotUnique: true } : null;
            }),
            catchError(() => of(null)),
        );
    };
}
