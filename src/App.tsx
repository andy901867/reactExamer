import { useState,useRef,useContext,useEffect, useMemo } from 'react'
import './App.css'
import './assets/mybootstrap.scss'

import {CocheeContext} from './store/cocheeProvider'
import { useAxios } from './store/axiosProvider'

//components
import ButtonRadioSelector from './components/ButtonRadioSelector'
import TrueFalse from './components/TrueFalse'
import SingleOption from './components/SingleOption'
import MultipleOption from './components/MultipleOption'
import QuestionNavButton from './components/QuestionNavButton'
import CountDownTimer,{TimerHanlde} from './components/CountDownTimer'
import ConfirmEndExamModal, {ModalHandle as ComfirmEndExamModalHandle} from './components/modals/ConfirmEndExamModal';
import ScoreModal,{ModalHandle as ScoreModalHandle} from './components/modals/ScoreModal'

import { Question,TfQuestion,SQuestion,MQuestion } from './types/QuestionTypes'
import Mode from './enums/mode'
import EventEmitter from './utils/EventEmitter';
import { AnsweredEvent} from './types/EventTypes';

const smoothScrollToChild = (parentElement:HTMLElement, childElement:HTMLElement, duration=500) => {
  //destination為子元素到父元素頂部的距離
  const distance = childElement.getBoundingClientRect().top - parentElement.getBoundingClientRect().top;
  const start = parentElement.scrollTop;
  const startTime = performance.now();

  // 緩動函數：cubic bezier (0.42, 0, 0.58, 1)
  function easeInOutCubic(t:number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function scrollStep(timestamp:number) {
      const progress = (timestamp - startTime) / duration; 
      const easingProgress = easeInOutCubic(Math.min(progress, 1));
      const newScrollTop = start + distance * easingProgress;
      parentElement.scrollTop = newScrollTop;

      if (progress < 1) {
          requestAnimationFrame(scrollStep);
      }
  }

  requestAnimationFrame(scrollStep);
}

function App() {
  const axios = useAxios();
  const fontSizeSelector = [
    {name: "小",value:"s", fontSize:{questionSize:20, optionSize: 16}},
    {name: "中",value:"m", fontSize:{questionSize:24, optionSize: 18}},
    {name: "大",value:"l", fontSize:{questionSize:32, optionSize: 21}},
  ]

  const [selectedFontSize, setSelectedFontSize] = useState(fontSizeSelector[0].fontSize);
  const [selectedFontSizeValue, setSelectedFontSizeValue] = useState(fontSizeSelector[0].value);

  const getFontSize = (value:string)=>{
    let selected = fontSizeSelector.find(item => item.value === value);
    if(selected){
      setSelectedFontSize(selected.fontSize);
      setSelectedFontSizeValue(value);
    }
  } 
  
  //useRef
  const questionScroller = useRef<HTMLDivElement | null>(null);
  const questionHtmlRefs = useRef<(HTMLDivElement|null)[]>([]);
  const timerRef = useRef<TimerHanlde>(null);
  const endExamRef = useRef<ComfirmEndExamModalHandle>(null);
  const scoreModalRef = useRef<ScoreModalHandle>(null);

  //mounted
  useEffect(()=>{
    const TfPromise = axios.get("/questionData/TfQuestions.json").then((resp:any)=>{
      //setTfQuestions(resp.data);
      const hasData = Array.isArray(resp.data);
      return hasData ? resp.data : [];
    })
    const SPromise = axios.get("/questionData/SQuestions.json").then((resp:any)=>{
      //setSQuestions(resp.data);
      const hasData = Array.isArray(resp.data);
      return hasData ? resp.data : [];
    })
    const mPromise = axios.get("/questionData/MQuestions.json").then((resp:any )=>{
      //setMQuestions(resp.data);
      const hasData = Array.isArray(resp.data);
      return hasData ? resp.data : [];
    })
    Promise.all([TfPromise,SPromise,mPromise]).then(([tf,s,m])=>{
      setQuestions([...tf,...s,...m]);
      timerRef.current?.start();
    })
  },[])

  const [questions,setQuestions] = useState<Array<Question>>([]);

  const tfQuestions = useMemo(()=>{
    return questions.filter(question=>question.type === "tf");
  },[questions]);

  const sQuestions = useMemo(()=>{
    return questions.filter(question=>question.type === "s");
  },[questions]);

  const mQuestions = useMemo(()=>{
    return questions.filter(question=>question.type === "m") as MQuestion[];
  },[questions]);

  const duration = 7200; //unit:second

  //states
  const [score,setScore] = useState<number| null>(null);
  const [correctCount,setCorrectCount] = useState<number | null>(null);
  const [shouldOpenScoreModal, setShouldOpenScoreModal] = useState<boolean>(false);

  //設定題目作答時的監聽器，好讓題目作答時更新題目的狀態  
  const isQuestionListenerAdded = useRef(false);
  useEffect(()=>{
    if(!isQuestionListenerAdded.current && questions.length > 0){
      questions.forEach(question=>{
        const handleAnswered = (eventData:AnsweredEvent) => {
          setQuestions(previousQuestions => {
            return previousQuestions.map(q => {
              if (q.id === eventData.questionId) {
                const renewedQ: Question = { ...q }; // 創建新物件，避免直接修改
                renewedQ.student_answer = eventData.studentAnswer; // 更新值
                return renewedQ;
              }
              return q;
            });
          });
        }
        const listener = EventEmitter.addListener(`Answered${question.id}`,handleAnswered);
        return ()=>{
          listener.remove();
        }
      })
      isQuestionListenerAdded.current = true;
    }
  },[questions])  
  

  const navigateToQuestion = (type:string, questionId:Number)=>{    
    let targetElement:HTMLElement | null = null;
    var elementIndex = questions.findIndex(question => question.id === questionId);
    targetElement = questionHtmlRefs.current[elementIndex];
    if(questionScroller.current && targetElement){
      smoothScrollToChild(questionScroller.current,targetElement)
    }
  }

  const {value:{mode,isDuringTest},updateValue:updateCocheeContext} = useContext(CocheeContext)

  const openConfirmModal = ()=>{
    endExamRef.current?.openModal(); 
  }
  const openScoreModal = ()=>{
    scoreModalRef.current?.openModal();
  }

  const endExam = ()=>{
    updateCocheeContext("isDuringTest", false);
    
    //如果是測驗模式就要算分數
    if(mode === Mode.exam){
      //滿分100分，每題平均分配分數權重
      const scorePerQuestion = 100 / questions.length;
      let correctCount = 0;
      let socre = 0;
      tfQuestions.forEach(question=>{
        if(question.student_answer === question.answer){
          correctCount++;
          socre += scorePerQuestion;
        }
      })
      sQuestions.forEach(question=>{
        if(question.student_answer === question.answer){
          correctCount++;
          socre += scorePerQuestion;
        }
      })
      mQuestions.forEach(question=>{
        if(question.student_answer.length === question.answer.length){
          const isCorrect = question.answer.every(answer=>{
            return question.student_answer.includes(answer);
          })
          if(isCorrect){
            correctCount++;
            socre += scorePerQuestion;
          }
        }
      })      
      setCorrectCount(correctCount);
      setScore(Math.round(socre));
      setShouldOpenScoreModal(true);
    }
  }

  useEffect(()=>{
    scoreModalRef.current?.openModal();
  },[shouldOpenScoreModal,score])

  const handleEndBtn = ()=>{
    timerRef.current?.stop();
    endExamRef.current?.closeModal();
    //endExam();
  }

  return (
    <>
      <div className='w-100 flex-grow-1 row flex-column-reverse flex-md-row g-0'>
        <div className='col-md-4 bg-success p-3 pb-md-3 pb-0 overflow-auto d-flex flex-md-column'>
          {
            tfQuestions.length> 0 && 
            <div>          
              <h3 className="text-white nowrap question-nav-type d-none d-md-inline">是非題</h3>
              <div className="question-nav-btns">
                {tfQuestions.map((question)=>(
                  <QuestionNavButton question={question} questionNo={questions.findIndex(q=> q.id===question.id)+1} handleClick={navigateToQuestion} key={question.id}></QuestionNavButton>
                ))}
              </div>
            </div>
          }
          {
            sQuestions.length> 0 && 
            <div>          
              <h3 className="text-white nowrap question-nav-type d-none d-md-inline">單選題</h3>
              <div className="question-nav-btns">
                {sQuestions.map((question)=>(
                  <QuestionNavButton question={question} questionNo={questions.findIndex(q=> q.id===question.id)+1} handleClick={navigateToQuestion} key={question.id}></QuestionNavButton>
                ))}
              </div>
            </div>
          }
          {
            mQuestions.length > 0 &&
            <div>          
              <h3 className="text-white nowrap question-nav-type d-none d-md-inline">多選題</h3>
              <div className="question-nav-btns">
                {mQuestions.map((question)=>(
                  <QuestionNavButton question={question} questionNo={questions.findIndex(q=> q.id===question.id)+1} handleClick={navigateToQuestion} key={question.id}></QuestionNavButton>
                ))}
              </div>
            </div>
          }
        </div>
        <div className='col-md-8 d-flex flex-column flex-grow-1'>
          <div className="shadow bg-white p-2 position-sticky top-0 left-0" style={{zIndex:10}}>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {mode===Mode.exam && 
                  <CountDownTimer duration={duration} endCallBack={endExam} ref={timerRef}></CountDownTimer>
                }
              </div>
              <div className='d-flex align-items-center'>
                {mode === Mode.exam && !isDuringTest &&
                  <button className='btn btn-success' onClick={openScoreModal}>查看成績</button>
                }
                {mode===Mode.exam && isDuringTest &&
                  <button className='btn btn-success' onClick={openConfirmModal}>結束考試</button>
                }                
                <div className='ms-1'>
                  <ButtonRadioSelector items={fontSizeSelector} selectedValue={selectedFontSizeValue} onValueChange={getFontSize}></ButtonRadioSelector>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="w-100 h-100 position-absolute top-0 start-0 overflow-auto pt-3" ref={questionScroller}>              
              <div className="container">
                {
                  questions.map((question,index)=>{
                    switch(question.type){
                      case "tf":
                        return (    
                          <div className="bg-white rounded shadow-sm mb-3 overflow-hidden" key={question.id} ref={ele=>questionHtmlRefs.current[index]=ele}>
                            <TrueFalse question={question as TfQuestion} questionNo={index+1} fontSize={selectedFontSize}></TrueFalse>
                          </div>
                        )
                      case "s":
                        return (
                          <div className="bg-white rounded shadow-sm mb-3 overflow-hidden" key={question.id} ref={ele=>questionHtmlRefs.current[index]=ele}>
                            <SingleOption question={question as SQuestion} questionNo={index+1} fontSize={selectedFontSize}></SingleOption>
                          </div>
                        )
                      case "m":
                        return(
                          <div className="bg-white rounded shadow-sm mb-3 overflow-hidden" key={question.id} ref={ele=>questionHtmlRefs.current[index]=ele}>
                            <MultipleOption question={question as MQuestion} questionNo={index+1} fontSize={selectedFontSize}></MultipleOption>
                          </div>
                        )
                    }
                  })
                }                              
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmEndExamModal ref={endExamRef} onConfirm={handleEndBtn}></ConfirmEndExamModal>
      {score !== null &&
        <ScoreModal ref={scoreModalRef} score={score} usedTime={duration - (timerRef.current?.remainingTime? timerRef.current?.remainingTime:0)} correctCount={correctCount?correctCount:0} totalCount={questions.length}></ScoreModal>
      }
      
    </>
  )
}

export default App
