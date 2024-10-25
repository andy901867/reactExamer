import { useState,useEffect } from "react";
import EventEmitter from "../utils/EventEmitter";
import {RemarkQuestionEvent,IsAnsweredEvent} from "../types/EventTypes";

interface Props{
    question:Question
}
interface Question {
    id:number;
}

const QuestionNavButton = ({question}:Props)=>{
    const [isRemarked, setIsRemarked] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    useEffect(()=>{
        const remarkListener = EventEmitter.addListener(`RemarkQuestion${question.id}`,(eventData:RemarkQuestionEvent)=>{
            setIsRemarked(eventData.isRemarked)
        });
        const answerListener = EventEmitter.addListener(`IsAnswered${question.id}`,(eventData:IsAnsweredEvent)=>{
            setIsAnswered(eventData.isAnswered)
        });
        return ()=>{
            remarkListener.remove();
            answerListener.remove();
        }
    },[])
    return (
        <div>
            <div className="mx-1 d-flex flex-column align-items-center mb-2">
                <button className={`mybtn navlabel mb-1 ${isAnswered?'bg-process':''}`}>1</button>
                <div className={`w-75 ${isRemarked?'remarked':'unremark'}`}></div>
            </div>
        </div>
    )
}

export default QuestionNavButton;