import { ReactNode } from "react";
import CocheeContext from "./cocheeContext";
import Mode from "../enums/mode";

interface Props{
    children: ReactNode
}

const cocheeContext = {
    mode: Mode.exam,
    isDuringTest: true
}

const CocheeProvider = ({children}:Props)=>{
    return (
        <CocheeContext.Provider value={cocheeContext}>{children}</CocheeContext.Provider>
    )
}

export default CocheeProvider;