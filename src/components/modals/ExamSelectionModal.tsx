import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Modal } from 'bootstrap';

export interface ExamOption {
  id: string;
  label: string;
  url: string;
}

export interface ExamSelectionModalHandle {
  openModal: () => void;
  closeModal: () => void;
}

interface Props {
  exams: ExamOption[];
  onSelect: (exam: ExamOption) => void;
  isLoading: boolean;
  error?: string | null;
}

const ExamSelectionModal = forwardRef<ExamSelectionModalHandle, Props>(
  ({ exams, onSelect, isLoading, error }, ref) => {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const modalInstance = useRef<Modal | null>(null);

    useEffect(() => {
      if (elementRef.current) {
        modalInstance.current = new Modal(elementRef.current, { backdrop: 'static', keyboard: false });
      }
      return () => {
        modalInstance.current?.dispose();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      openModal() {
        modalInstance.current?.show();
      },
      closeModal() {
        modalInstance.current?.hide();
      },
    }));

    const handleSelect = (exam: ExamOption) => {
      if (isLoading) {
        return;
      }
      onSelect(exam);
    };

    return (
      <div className="modal" tabIndex={-1} ref={elementRef}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">選擇考卷</h5>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
              <p className="text-muted small mb-3">請選擇要練習的考卷，選擇後才會開始載入題目。</p>
              <div className="d-flex flex-column gap-2">
                {exams.map((exam) => (
                  <button
                    type="button"
                    key={exam.id}
                    className="btn btn-outline-success text-start exam-picker-option"
                    disabled={isLoading}
                    onClick={() => handleSelect(exam)}
                  >
                    <span className="fw-bold d-block">{exam.label}</span>
                    <span className="text-muted small">點擊開始作答</span>
                  </button>
                ))}
                {!exams.length && <div className="text-center text-muted py-3">目前沒有可選擇的考卷。</div>}
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              {isLoading ? (
                <div className="d-flex align-items-center gap-2">
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                  <span className="text-muted small">考卷載入中...</span>
                </div>
              ) : (
                <span className="text-muted small">選好考卷後，系統才會開始倒數計時。</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExamSelectionModal.displayName = 'ExamSelectionModal';

export default ExamSelectionModal;
