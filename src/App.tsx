import { useState,useRef,useContext,useEffect } from 'react'
import './App.css'
import './assets/mybootstrap.scss'

import {CocheeContext} from './store/cocheeProvider'

import ButtonRadioSelector from './components/ButtonRadioSelector'
import TrueFalse from './components/TrueFalse'
import QuestionNavButton from './components/QuestionNavButton'
import CountDownTimer,{TimerHanlde} from './components/CountDownTimer'
import ConfirmEndExamModal, {ModalHandle} from './components/modals/ConfirmEndExamModal';

import tfQuestionsData from './questionData/TfQuestions'
import Mode from './enums/mode'
import EventEmitter from './utils/EventEmitter';
import { TfAnsweredEvent } from './types/EventTypes';

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

  const [tfQuestions, setTfQuestions] = useState(tfQuestionsData);

  //設定題目作答時的監聽器，好讓題目作答時更新題目的狀態
  const isQuestionListenerAdded = useRef(false);
  useEffect(() => {
    if(!isQuestionListenerAdded.current){
      tfQuestions.forEach(question => {
        const handleTfAnswered = (eventData: TfAnsweredEvent) => {
          setTfQuestions( previousQuestions => {
            return previousQuestions.map(q => {
              if (q.id === eventData.questionId) {
                return { ...q, student_answer: eventData.studentAnswer };
              }
              return q;
            });
          })
        };

        const tfListener = EventEmitter.addListener(`Answered${question.id}`, handleTfAnswered);
        

        return () => {
          tfListener.remove();
        };
      });

      isQuestionListenerAdded.current = true;
    }
    
  }, [tfQuestions]);

  //useRef
  const questionScroller = useRef<HTMLDivElement | null>(null);
  const tureFalseRef = useRef<(HTMLDivElement|null)[]>([]);
  const timerRef = useRef<TimerHanlde>(null);
  const endExamRef = useRef<ModalHandle>(null);

  const navigateToQuestion = (type:string, questionId:Number)=>{    
    let targetElement:HTMLElement | null = null;
    switch(type){
      case "tf":
        var elementIndex = tfQuestions.findIndex(question=> question.id == questionId);
        targetElement = tureFalseRef.current[elementIndex];
        break
    }
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
      console.log(tfQuestions)
    }
  }

  const handleEndBtn = ()=>{
    timerRef.current?.stop();
    //endExam();
  }

  return (
    <>
      <div className='w-100 flex-grow-1 row g-0'>
        <div className='col-4 bg-primary'>
        <div>
          
          <h3 className="text-white nowrap question-nav-type">是非題</h3>
          <div className="d-flex question-nav-btns flex-wrap">
            {tfQuestions.map((question)=>(
              <QuestionNavButton question={question} handleClick={navigateToQuestion}></QuestionNavButton>
            ))}
          </div>
        </div>
        </div>
        <div className='col-8 d-flex flex-column'>
          <div className="shadow bg-white p-2 position-sticky top-0 left-0" style={{zIndex:10}}>
            <div className='d-flex justify-content-between align-items-center'>
              <CountDownTimer duration={60} endCallBack={endExam} ref={timerRef}></CountDownTimer>
              <div className='d-flex align-items-center'>
                <button className='btn btn-primary' onClick={openConfirmModal}>結束考試</button>
                <div className='ms-1'>
                  <ButtonRadioSelector items={fontSizeSelector} selectedValue={selectedFontSizeValue} onValueChange={getFontSize}></ButtonRadioSelector>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="w-100 h-100 position-absolute top-0 start-0 overflow-auto pt-3" ref={questionScroller}>              
              <div className="container">              
                {tfQuestions.map((question,index)=>(
                  <div className="bg-white rounded shadow-sm mb-3 overflow-hidden" key={question.id} ref={ele => tureFalseRef.current[index]=ele}>
                    <TrueFalse question={question} questionNo={index+1} fontSize={selectedFontSize}></TrueFalse>
                  </div>
                ))}
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
