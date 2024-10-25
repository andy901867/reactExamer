import { useState } from 'react'
import './App.css'
import './assets/mybootstrap.scss'

import CocheeProvider from './store/cocheeProvider'

import ButtonRadioSelector from './components/ButtonRadioSelector'
import TrueFalse from './components/TrueFalse'
import QuestionNavButton from './components/QuestionNavButton'

import tfQuestions from './questionData/TfQuestions'

function App() {
  let sampleQuestion = {
    question:"這是是非題的題目",
    id:1,
    type:"tf",
    options: [{optionid:1,optiontext:"O"},{optionid:2,optiontext:"X"}],
    answer:2,
    exp:"詳請解釋",
    gorder:0,

    student_answer:undefined,
    isRemarked: false,
  }

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

  return (
    <>
      <div className='w-100 flex-grow-1 row'>
        <div className='col-4 bg-primary'>
        <div>
          <h3 className="text-white nowrap question-nav-type">是非題</h3>
          <div className="d-flex question-nav-btns flex-wrap">
            {tfQuestions.map((question)=>(
              <QuestionNavButton question={question}></QuestionNavButton>
            ))}
          </div>
        </div>
        </div>
        <div className='col-8'>
          <div className="container">
            <ButtonRadioSelector items={fontSizeSelector} selectedValue={selectedFontSizeValue} onValueChange={getFontSize}></ButtonRadioSelector>
            <CocheeProvider>
              {tfQuestions.map((question,index)=>(
                <div className="bg-white rounded shadow-sm mb-3 overflow-hidden">
                  <TrueFalse question={question} questionNo={index+1} fontSize={selectedFontSize}></TrueFalse>
                </div>
              ))}
            </CocheeProvider>
            
          </div>
        </div>
      </div>      
    </>
  )
}

export default App
