function Modal({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__container">
        <p>{message}</p>
        <button onClick={onClose}>閉じる</button>
      </div>
    </div>
  )
}

export default Modal
