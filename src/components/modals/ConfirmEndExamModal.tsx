import { Modal } from 'bootstrap';
import { useRef, forwardRef,useImperativeHandle,useEffect } from 'react';

export interface ModalHandle{
    openModal:Function,
    closeModal: Function
}

interface Props{
    onConfirm:Function
}
const ConfirmEndExamModal = forwardRef<ModalHandle,Props>(({onConfirm},ref)=>{
    const componentElement = useRef<HTMLDivElement|null>(null);
    const modal = useRef<Modal|null>(null);
    useEffect(()=>{
        if(componentElement.current!==null){
            modal.current = new Modal(componentElement.current);
        }
    },[componentElement])

    const handleEndBtn = ()=>{
        onConfirm();
    }
    useImperativeHandle(ref,()=>{
        return{
            openModal(){
                modal.current?.show();
            },
            closeModal(){
                modal.current?.hide();
            }
        }
    })
    return(
        <div className="modal" ref={componentElement}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Modal title</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>已經寫完考卷了嗎?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" className="btn btn-danger" onClick={handleEndBtn}>結束測驗</button>
                    </div>
                </div>
            </div>
        </div>
    )
})


export default ConfirmEndExamModal;