import { createContext, ReactNode,useContext } from "react";
import axios, { AxiosInstance } from "axios";

interface Props{
    children: ReactNode
}

interface Value{
    axiosInstance: AxiosInstance
}

const AxiosContext = createContext({} as Value);

const AxiosProvider = ({children}:Props)=>{
    const axiosInstance = axios.create({
        //配置
    });
    
    return (
        <AxiosContext.Provider value={{axiosInstance: axiosInstance}}>{children}</AxiosContext.Provider>
    )
}
const useAxios = () => useContext(AxiosContext).axiosInstance;
//const {axiosInstance:useAxios} = useContext(AxiosContext);

export {AxiosContext, AxiosProvider, useAxios}
