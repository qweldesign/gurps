import { type ReactNode } from 'react'

function Modal({ message, onClose }: { message: ReactNode, onClose: () => void }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__container">
        <div>{message}</div>
        <button onClick={onClose}>閉じる</button>
      </div>
    </div>
  )
}

export default Modal
