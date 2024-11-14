import {useState, useContext, useMemo, useEffect} from 'react';
import {CocheeContext} from '../store/cocheeProvider'
import Mode from '../enums/mode';
import EventEmitter from '../utils/EventEmitter';
import { RemarkQuestionEvent,TfAnsweredEvent } from '../types/EventTypes';
import { SQuestion } from '../types/QuestionTypes';

interface Props {
    question: SQuestion;
    questionNo: number;//題號
    fontSize: IFontSize;
}


interface IFontSize{
  questionSize: number;
  optionSize: number;
}

const defaultFontSize:IFontSize = {
  questionSize: 20,
  optionSize: 16
}



function SingleOption({question,questionNo,fontSize=defaultFontSize}:Props){

    const {value:{mode,isDuringTest}} = useContext(CocheeContext);

    //studentAnswer為學生選取選項的ID值
    const [studentAnswer, setStudentAnswer] = useState(question.student_answer);
    const [isShowAnswer, setIsShowAnswer] = useState(!isDuringTest);
    const [isRemarked, setIsRemarked] = useState(false);        

    let isShowExplain = !isDuringTest || (mode === Mode.practice && isShowAnswer);

    useEffect(()=>{
      if(!isDuringTest){
        setIsShowAnswer(true);
      }
    },[isDuringTest])

    useEffect(()=>{
      let isAnswered = false;
      if(studentAnswer!=undefined){
        isAnswered = true;
      }
      const emitData:TfAnsweredEvent = {
        isAnswered,
        questionId:question.id,
        studentAnswer: studentAnswer
      }
      EventEmitter.emit(`Answered${question.id}`,emitData)
    },[studentAnswer])


    const resetQuestion = ()=>{
      setStudentAnswer(undefined);
    }
    
    const handleOnChange = (event:React.ChangeEvent<HTMLInputElement>)=>{
      const selectedAnswer = parseInt(event.target.value);      
      setStudentAnswer(selectedAnswer);

      if(mode === Mode.practice){
        setIsShowAnswer(true);
        setTimeout(()=>{
          if(selectedAnswer!=question.answer){
            resetQuestion();
          }
        },350)
      }
    }

    const handleRemark = ()=>{
      setIsRemarked(!isRemarked);
      const emitData:RemarkQuestionEvent = {
        isRemarked: !isRemarked,
        questionId: question.id
      }
      EventEmitter.emit(`RemarkQuestion${question.id}`,emitData);
    }

    const isOptionCorrect = (optionId:number) =>{
      return optionId == question.answer;
    }

    const isUserChooseOption = (optionId:number) =>{
      return optionId == studentAnswer;
    }
      
    

    return (
        <div>
            {/* 題目 */}
            <div className="d-flex justify-content-between p-3 border-bottom">
                <div style={{fontSize:`${fontSize.questionSize}px`}}>
                    <span>{questionNo}. </span>
                    <span className="m-0">{question.question}</span>
                </div>
                <div className="fz20 nowrap">
                  {mode===Mode.exam && isDuringTest &&
                    <i className={`fas fa-undo-alt me-1 ${studentAnswer? 'question_reset':'text-muted' }`}
                      onClick={resetQuestion}>                        
                    </i>
                  }
                  {isDuringTest && 
                    <i className={`fa-bookmark pointer ${isRemarked?'fas text-warning':'far text-muted'}`} onClick={handleRemark}></i>
                  }                                                                               
                </div>
            </div>
            {/* END: 題目 */}
            {/* 選項 */}
            <div className="px-3 pt-3">
                <div className="row">
                  {question.options.map( option => (
                    <div className="col-md-6 col-12 mb-3">
                      <label className="option">
                        <input type="radio" className="d-none" value={option.optionid} onChange={handleOnChange } checked={studentAnswer === option.optionid} disabled={!isDuringTest} />
                        <div className={`ripple-container 
                          ${isShowAnswer && isOptionCorrect(option.optionid) && !isUserChooseOption(option.optionid) && mode===Mode.exam  ? "correct_option":""} 
                          ${isShowAnswer && isUserChooseOption(option.optionid) && !isOptionCorrect(option.optionid) ? "wrong_option":""}`}></div>
                        <span style={{fontSize:`${fontSize.optionSize}px`}}>{option.optiontext}</span>
                        <div className="option-icons">
                          { mode === Mode.exam && isShowAnswer && (studentAnswer === undefined || studentAnswer === null) && isOptionCorrect(option.optionid) &&
                            <span className="fz12 mybtn px-1 py-0 bg-danger defaultmouse">未作答</span>
                          }                          
                          {isShowAnswer && isOptionCorrect(option.optionid) && ((isUserChooseOption(option.optionid) && mode === Mode.practice)|| mode===Mode.exam)  &&
                            <i className="fas fa-check option-checked" style={{opacity:1}}></i>
                          }
                          {
                            isShowAnswer && isUserChooseOption(option.optionid) && !isOptionCorrect(option.optionid) &&
                            <i className="fas fa-times option-checked"></i>
                          }
                        </div>
                      </label>
                    </div>
                  ))}                  
                </div>
            </div>
            {/* END: 選項 */}
            {/* 詳解 */}
            {isShowExplain && 
              <div className="p-3">
                <h3 className="fz18">試題詳解：</h3>
                <p className="mb-0">{question.exp}</p>
              </div>
            }            
            {/* END:詳解 */}
        </div>
    )
}

export default SingleOption