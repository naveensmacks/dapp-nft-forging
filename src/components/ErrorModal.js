import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";

const ErrorModal = (props) => {
  return (
    <>
    {ReactDOM.createPortal(
      <Modal
        isOpen={props.isOpen}
        onRequestClose={() => props.closeHandler("")}>
        <h2>{props.title}</h2>
        <p>{props.message}</p>
      </Modal> ,
      document.getElementById("modal-root")
      )}
      </>
  );
};

export default ErrorModal;
