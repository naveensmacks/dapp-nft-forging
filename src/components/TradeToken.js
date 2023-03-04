import React,{useState} from 'react'
import { ethers } from "ethers";
import { Card, Button, Form } from "react-bootstrap";
import ForgeTokenABI from "../abis/forgeTokenABI.json";
import ErrorModal from './ErrorModal';

const TradeToken = (props) => {
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setModalProps = (isOpen, title, message) => {
    setIsModalOpen(isOpen);
    setModalTitle(title);
    setModalMessage(message);
  };

  const closeHandler =()=> {
    setIsModalOpen(false);
  }
  const handleTrade = async (event) => {
    event.preventDefault();
    const fromTokenId = event.target.fromToken.value;
    const toTokenId = event.target.toToken.value;
    if (fromTokenId < 0 || fromTokenId > 2 || toTokenId < 0 || toTokenId > 2) {
      // display error message if tokenIds are not between 0 and 2
      setModalProps(true,"Error!","Token IDs must be between 0 and 2");
      return;
    }
    try {
      console.log(props.provider);
      const signer = await props.provider.getSigner();
      console.log(fromTokenId +" : " + toTokenId);
      const forgeTokenContract = new ethers.Contract(
        props.forgeTokenAddress,
        ForgeTokenABI,
        signer
      );
      console.log(3);
      const tx = await forgeTokenContract.tradeToken(fromTokenId, toTokenId);
      console.log(4);
      await tx.wait();
      setModalProps(true,"Success!","Traded successfully!");
    } catch (error) {
      console.log(error);
      setModalProps(true,"Error!",error.data.message);
    }
  };
  return (
    <>
      <Card style={{ width: "50%",marginTop: "5%", marginLeft: "auto", marginRight: "auto" }}>
        <Card.Body>
          <Form onSubmit={handleTrade}>
            <Form.Group className="mb-3" controlId="fromToken" >
              <Form.Label>From Token ID</Form.Label>
              <Form.Control type="number" min="0" max="2" required />
            </Form.Group >
            <Form.Group className="mb-3" controlId="toToken" >
              <Form.Label>To Token ID</Form.Label>
              <Form.Control type="number" min="0" max="2" required />
            </Form.Group >
            <Button type="submit">Trade</Button>
          </Form>
        </Card.Body>
        </Card>
        <ErrorModal isOpen={isModalOpen} title={modalTitle} message={modalMessage} closeHandler={closeHandler} />
      </>
  )
}

export default TradeToken