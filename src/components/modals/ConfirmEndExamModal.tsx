import { Modal } from 'bootstrap';
import { useRef, forwardRef,useImperativeHandle } from 'react';

export interface ModalHandle{
    openModal:Function
}

interface Props{
    onConfirm:Function
}
const ConfirmEndExamModal = forwardRef<ModalHandle,Props>(({onConfirm},ref)=>{
    const handleEndBtn = ()=>{
        onConfirm();
    }
    useImperativeHandle(ref,()=>{
        return{
            openModal(){
                const modalEl = document.getElementById("confirmEndExamModal");
                if(modalEl!==null){
                    const modal = new Modal(modalEl);
                    modal.show();
                }
            }
        }
    })
    return(
        <div className="modal" id="confirmEndExamModal">
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