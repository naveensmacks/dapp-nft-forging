import React from "react";
import ReactDOM from "react-dom";

import {Modal, Button } from "react-bootstrap";

const ErrorModal = (props) => {
  return (
    <>
    {ReactDOM.createPortal(
      <Modal show={props.isOpen} onHide={props.closeHandler}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered >
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.closeHandler}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("modal-root")
      )}
      </>
  );
};

export default ErrorModal;


