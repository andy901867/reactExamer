export interface RemarkQuestionEvent{
    isRemarked: boolean
    questionId: number
}

export interface __BaseAnsweredEvent{
    isAnswered: boolean,
    questionId: number
    type: string
}

export type AnsweredEvent = TfAnsweredEvent | SAnsweredEvent | MAnsweredEvent

export interface TfAnsweredEvent extends __BaseAnsweredEvent{
    studentAnswer: number | undefined
}

export interface SAnsweredEvent extends __BaseAnsweredEvent{
    studentAnswer: number | undefined
}

export interface MAnsweredEvent extends __BaseAnsweredEvent{
    studentAnswer: Array<number>
}