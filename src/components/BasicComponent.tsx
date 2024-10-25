import { useState,useEffect } from "react";

interface BasicComponentProps {
    size:number;
    name: string;
}

//現在的趨勢比較推崇functional component並且使用hook
//在hook出現之前，functional component甚至被稱作stateless component
function BasicComponent({ size, name}:BasicComponentProps){
    const [title,setTitle] = useState("Initial Value");

    //useEffect是用來監聽變數變化的hook(功能類似於vue的watch)
    //由於第二個參數是一個array，這也意謂著可以同時監聽多個變數而觸發同樣的function
    useEffect(()=>{
        console.log("changed")
    }, [title])

    //直接定義function就好，不用像vue需要包在methods裡
    const handleOnclick = ()=>{
        setTitle("ANDY WEARS Sunglasses");
    }
    return (
        <div>
            <h1>{title}</h1>
            <h3 style={{fontSize: size +'px'}}>{name}</h3>
            <button onClick={handleOnclick}>click</button>
        </div>
    )
}

export default BasicComponent;