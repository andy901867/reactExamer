export interface TfQuestion {
    id:number;
    question:string;
    answer: number;//某個option的Id
    exp: string;
    options: Array<TfOption>;
    student_answer?: number; //某個option的Id
    type:string;
}

interface TfOption {
    optionid: number;
    optiontext: string;
}