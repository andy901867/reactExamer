import { createContext } from "react";
import Mode from "../enums/mode";

const CocheeContext = createContext({
    mode: Mode.practice,
    isDuringTest: true
})

export default CocheeContext;