export interface Category {
    category: string;
    links: Link[];
}
export interface Link {
    id: number;
    text: string;
}
export type Cashable = ExerciseModel | Category[];

// EXERCISE
export interface ExerciseModel {
    exercise: ExerciseInfoModel;
    props: ExercisePropsModel;
}

export interface ExerciseInfoModel {
    id: number;
    path: string;
    name: string;
    category: string;
    description: string | null;
    source: string | null;
    sourceUrl: string | null;
    author: string | null;
    authorUrl: string | null;
    createdBy: string | null;
}

export type ExercisePropsModel = PropsModel | PropsCountryModel | PropsQuizModel;
export type PropsModel = {
    [key: string]: string;
};

// EXERCISE CARDS
export interface ExerciseCardsModel extends ExerciseModel {
    props: PropsCardsModel;
    data: ExerciseDataModel;
}
export interface PropsCardsModel extends PropsModel {
    card: string;
    label1: string;
    label2: string;
    label3?: string;
}
export type ExerciseDataModel = string[][];

export interface ExerciseCardsModelAdapted extends ExerciseCardsModel {
    labels: string[];
    state: {
        counts: number[];
        status: boolean;
        rows: number;
        row: number;
        tabs: boolean[];
        card: number;
    };
}

// EXERCISE QUIZ
export interface ExerciseQuizModel extends ExerciseModel {
    correct: number[] | null;
    questions: QuestionModel[];
}
export interface QuestionModel {
    text: string;
    value: number;
    answers: AnswerModel[];
}
export interface AnswerModel {
    text: string;
    value: number;
}
export type PropsQuizModel = {
    highlight: string;
    level: string;
    lang: string;
    certification: string;
};

// EXERCISE MAPS
export type PropsCountryModel = {
    resource: string;
    resource_full: string;
};
