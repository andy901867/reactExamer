import { ReactNode, useState,createContext } from "react";
import Mode from "../enums/mode";

interface Props{
    children: ReactNode
}

interface ContextValue{
    mode: Mode,
    isDuringTest: boolean
}

const defaultValue:ContextValue = {
    mode: Mode.exam,
    isDuringTest: true
}

export const CocheeContext = createContext({value:defaultValue,updateValue:(key:string,newValue:any)=>{}});

export const CocheeProvider = ({children}:Props)=>{
    const [value,setValue] = useState<ContextValue>(defaultValue);
    const updateValue = (key:string, newValue:any) => {
        console.log("update cochee value")
        setValue(prevValue => ({
            ...prevValue,
            [key]: newValue,
        }));
    };
    return (
        <CocheeContext.Provider value={{value,updateValue}}>{children}</CocheeContext.Provider>
    )
}
