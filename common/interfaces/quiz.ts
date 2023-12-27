/**
 * A quiz
 */
export interface Quiz {
    /**
     * Maximum time for a QCM question in seconds
     */
    duration: number;
    /**
     * The unique identifier of the quiz
     */
    id: string;
    /**
     * The last modification date-time of the quiz in ISO8601 format
     */
    lastModification: string;
    /**
     * All questions part of the quiz
     */
    questions: Question[];
    /**
     * The title of the quiz
     */
    title: string;
    /**
     * The description of the quiz
     */
    description: string;
    /**
     * The title of the quiz
     */
    visibility?: boolean;
}

/**
 * A quiz question
 */
export interface Question {
    /**
     * The list of choices
     */
    choices?: Choice[];
    /**
     * The number of points assigned to the question. Has to be a multiple of 10.
     */
    points?: number;
    /**
     * The question itself
     */
    text?: string;
    /**
     * The type of quiz. Multiple Choice (QCM) or Open Response (QRL)
     */
    type: string;
}

/**
 * A choice
 */
export interface Choice {
    /**
     * A boolean which is true only when the choice is a correct answer
     */
    isCorrect?: boolean | null;
    /**
     * The choice itself
     */
    text: string;
}

