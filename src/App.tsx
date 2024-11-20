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
import ConfirmEndExamModal, {ModalHandle} from './components/modals/ConfirmEndExamModal';

import { Question,TfQuestion,SQuestion,MQuestion } from './types/QuestionTypes'
import Mode from './enums/mode'
import EventEmitter from './utils/EventEmitter';
import { AnsweredEvent,TfAnsweredEvent,SAnsweredEvent,MAnsweredEvent } from './types/EventTypes';

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
  const tureFalseRef = useRef<(HTMLDivElement|null)[]>([]);
  const singleOptionRef = useRef<(HTMLDivElement|null)[]>([]);
  const multipleOptionRef = useRef<Array<HTMLDivElement|null>>([]);
  const questionHtmlRefs = useRef<(HTMLDivElement|null)[]>([]);
  const timerRef = useRef<TimerHanlde>(null);
  const endExamRef = useRef<ModalHandle>(null);

  //mounted
  useEffect(()=>{
    const TfPromise = axios.get("/questionData/TfQuestions.json").then((resp:any)=>{
      //setTfQuestions(resp.data);
      return resp.data;
    })
    const SPromise = axios.get("/questionData/SQuestions.json").then((resp:any)=>{
      //setSQuestions(resp.data);
      return resp.data;
    })
    const mPromise = axios.get("/questionData/MQuestions.json").then((resp:any )=>{
      //setMQuestions(resp.data);
      return resp.data;
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
    return questions.filter(question=>question.type === "m");
  },[questions]);

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
    console.log(type,questionId)
    let targetElement:HTMLElement | null = null;
    var elementIndex = questions.findIndex(question => question.id === questionId);
    targetElement = questionHtmlRefs.current[elementIndex];
    if(questionScroller.current && targetElement){
      smoothScrollToChild(questionScroller.current,targetElement)
    }
  }

  const {value:{mode},updateValue:updateCocheeContext} = useContext(CocheeContext)

  const openConfirmModal = ()=>{
    endExamRef.current?.openModal(); 
  }

  const endExam = ()=>{
    updateCocheeContext("isDuringTest", false);
    //如果是測驗模式就要算分數
    if(mode === Mode.exam){
      tfQuestions.forEach(question=>{
        if(question.student_answer === question.answer){
          console.log("答對了")
        }
      })
      console.log(questions)
    }
  }

  const handleEndBtn = ()=>{
    timerRef.current?.stop();
    //endExam();
  }

  return (
    <>
      <div className='w-100 flex-grow-1 row g-0'>
        <div className='col-4 bg-success'>
          <div>          
            <h3 className="text-white nowrap question-nav-type">是非題</h3>
            <div className="d-flex question-nav-btns flex-wrap">
              {tfQuestions.map((question)=>(
                <QuestionNavButton question={question} handleClick={navigateToQuestion}></QuestionNavButton>
              ))}
            </div>
          </div>
          <div>          
            <h3 className="text-white nowrap question-nav-type">單選題</h3>
            <div className="d-flex question-nav-btns flex-wrap">
              {sQuestions.map((question)=>(
                <QuestionNavButton question={question} handleClick={navigateToQuestion}></QuestionNavButton>
              ))}
            </div>
          </div>
          <div>          
            <h3 className="text-white nowrap question-nav-type">多選題</h3>
            <div className="d-flex question-nav-btns flex-wrap">
              {mQuestions.map((question)=>(
                <QuestionNavButton question={question} handleClick={navigateToQuestion}></QuestionNavButton>
              ))}
            </div>
          </div>
        </div>
        <div className='col-8 d-flex flex-column'>
          <div className="shadow bg-white p-2 position-sticky top-0 left-0" style={{zIndex:10}}>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                {mode===Mode.exam &&
                  <CountDownTimer duration={60} endCallBack={endExam} ref={timerRef}></CountDownTimer>
                }
              </div>
              <div className='d-flex align-items-center'>
                {mode===Mode.exam &&
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
    </>
  )
}

export default App
