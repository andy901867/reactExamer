import { useState, useEffect, useMemo,forwardRef, useImperativeHandle,useRef } from "react";

interface Props{
    duration:number; //單位:秒
    endCallBack:Function
}

export interface TimerHanlde{
    start:Function
    stop:Function
}

const CountDownTimer = forwardRef<TimerHanlde,Props>(({duration,endCallBack},ref)=>{
    const [remainingTime, setRemaingTime] = useState(duration);
    const reqRef = useRef<number|null>(null);

    const formattedTime = useMemo(()=>{
        const hours = Math.floor(remainingTime/3600);
        const minutes = Math.floor((remainingTime%3600)/60);
        const seconds = Math.floor(remainingTime%60);

        const formatedHours:string = Math.floor(hours/10)<1 ? "0"+hours : hours.toString();
        const formatedMinutes:string = Math.floor(minutes/10)<1 ? "0"+minutes : minutes.toString();
        const formatedSeconds:string = Math.floor(seconds/10)<1 ? "0"+seconds : seconds.toString();
        return `${formatedHours}:${formatedMinutes}:${formatedSeconds}`;
    },[remainingTime])

    const startCountDown = ()=>{
        let currentRemainingTime = duration;
        let timeStart:number|null = null;
        const step = (timestamp:number)=>{
            if(timeStart===null){
                timeStart = timestamp
            }
            let timePassed = timestamp - timeStart;
            if(timePassed>=1000){
                const errorDeviation = timePassed - 1000;
                currentRemainingTime--;
                setRemaingTime(currentRemainingTime);
                timeStart = timestamp - errorDeviation;
            }
            if(currentRemainingTime>0){
                reqRef.current = requestAnimationFrame(step)
            }
            else{
                stopCountDown();
            }
        }
        reqRef.current = requestAnimationFrame(step)
    }

    const stopCountDown = ()=>{
        if(reqRef.current!==null){
            cancelAnimationFrame(reqRef.current)
            endCallBack();
        }
        return remainingTime;
    }

    useImperativeHandle(ref,()=>{
        return{
            start(){
                return startCountDown();
            },
            stop(){
                return stopCountDown();
            }
        } 
    })
    

    return (
        <div>{formattedTime}</div>
    )
})

export default CountDownTimer;