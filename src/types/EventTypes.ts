export interface RemarkQuestionEvent{
    isRemarked: boolean
    questionId: number
}

export interface AnsweredEvent{
    isAnswered: boolean,
    questionId: number
}

export interface TfAnsweredEvent extends AnsweredEvent{
    studentAnswer: number | undefined
}