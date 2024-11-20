interface Option {
    optionid: number;
    optiontext: string;
}

export type Question = TfQuestion | SQuestion | MQuestion;

export interface TfQuestion {
    id:number;
    question:string;
    answer: number;//某個option的Id
    exp: string;
    options: Array<Option>;
    student_answer?: number; //某個option的Id
    type:string;
}

export interface SQuestion {
    id:number;
    question:string;
    answer: number;//某個option的Id
    exp: string;
    options: Array<Option>;
    student_answer?: number; //某個option的Id
    type:string;
}

export interface MQuestion{
    id:number;
    question:string;
    answer:Array<number>; //多個選項的Id值
    exp: string;
    options: Array<Option>;
    student_answer: Array<number>; //多個選項的Id值
    type:string;
}

