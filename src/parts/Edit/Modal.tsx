import { type ReactNode } from 'react'

function Modal({ message, onClose, onContinue }: { message: ReactNode, onClose: () => void, onContinue: (() => void) | null }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__container">
        <div>{message}</div>
        <div className="flex justify-center">
          <button className={onContinue ? '' : 'hidden'} onClick={onContinue!}>続行</button>
          <button onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}

export default Modal
