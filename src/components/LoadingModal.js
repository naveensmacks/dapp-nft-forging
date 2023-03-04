import React from "react";
import ReactDOM from "react-dom";

import { Modal, Button } from "react-bootstrap";

const LoadingModal = (props) => {
  return (
    <>
      {ReactDOM.createPortal(
        <Modal
          show={props.show}
          backdrop="static"
          keyboard={false}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header>
            <Modal.Title>{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{props.message}</Modal.Body>
        </Modal>,
        document.getElementById("modal-root")
      )}
    </>
  );
};

export default LoadingModal;
