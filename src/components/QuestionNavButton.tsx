import { useState,useEffect } from "react";
import EventEmitter from "../utils/EventEmitter";
import {RemarkQuestionEvent,AnsweredEvent} from "../types/EventTypes";

interface Props{
    question:Question,
    handleClick: Function,
    questionNo: number
}
interface Question {
    id:number;
    type:string;
}

const QuestionNavButton = ({question,handleClick, questionNo}:Props)=>{
    const [isRemarked, setIsRemarked] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    useEffect(()=>{        
        const remarkListener = EventEmitter.addListener(`RemarkQuestion${question.id}`,(eventData:RemarkQuestionEvent)=>{
            setIsRemarked(eventData.isRemarked)
        });
        const answerListener = EventEmitter.addListener(`Answered${question.id}`,(eventData:AnsweredEvent)=>{
            setIsAnswered(eventData.isAnswered)
        });
        return ()=>{
            remarkListener.remove();
            answerListener.remove();
        }
    },[])

    const navigateToQuestion = ()=>{
        handleClick(question.type, question.id);
    }

    return (
        <div onClick={navigateToQuestion}>
            <div className="mx-1 d-flex flex-column align-items-center mb-2">
                <button className={`mybtn navlabel mb-1 ${isAnswered?'bg-process':''}`}>{questionNo}</button>
                <div className={`w-75 ${isRemarked?'remarked':'unremark'}`}></div>
            </div>
        </div>
    )
}

export default QuestionNavButton;