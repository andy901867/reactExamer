import { Question } from "../../types/QuestionTypes";
import { forwardRef,useImperativeHandle,useRef,useMemo } from "react";
import { Modal } from "bootstrap";

interface Props{
    score: number| null,
    usedTime: number,
    correctCount: number,
    totalCount: number
}
export interface ModalHandle{
    openModal:()=>void,
    test:()=>void
}

const ScoreModal = forwardRef(({score,usedTime,correctCount,totalCount}:Props,ref)=>{

    const componentElement = useRef<HTMLDivElement|null>(null);
    const formattedUsedTime = useMemo(()=>{
        const hours = Math.floor(usedTime/3600);
        const minutes = Math.floor((usedTime%3600)/60);
        const seconds = Math.floor(usedTime%60);

        const stringHours:string = hours<=0 ? "" : hours+"小時";
        const stringMinutes:string = hours<=0 && minutes<=0 ? "" : minutes + "分"
        const stringSeconds:string = seconds +"秒"
        return stringHours + stringMinutes + stringSeconds;
    },[usedTime])

    useImperativeHandle<unknown, ModalHandle>(ref,()=>{
        return{
            openModal(){
                if(componentElement.current!==null){
                    const modal = new Modal(componentElement.current);
                    modal.show();
                }
            },
            test(){
                
            }
        }
    })

    return(
        <div className="modal fade" ref={componentElement}>
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">考試成績</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                    <div className="text-center">
                        <h2 className="fw-bold mb-5 text-warning fz48">{score}<span className="fz16">分</span></h2>
                        <p className="mb-1">答對題數: {correctCount}/{totalCount}</p>
                        <p className="mb-1">總共花費時間: {formattedUsedTime}</p>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                </div>
                </div>
            </div>
        </div>
    )
})

export default ScoreModal;