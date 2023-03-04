import React,{useState} from 'react'
import { ethers } from "ethers";
import { Card, Button, Form } from "react-bootstrap";
import ForgeTokenABI from "../abis/forgeTokenABI.json";
import ErrorModal from './ErrorModal';
import LoadingModal from './LoadingModal';

const TradeToken = (props) => {
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadModalShow, setLoadModalShow] = useState(false);

  const setModalProps = (isOpen, title, message) => {
    setIsModalOpen(isOpen);
    setModalTitle(title);
    setModalMessage(message);
  };

  const closeHandler =()=> {
    setIsModalOpen(false);
    props.fetchBalances();
  }
  const handleTrade = async (event) => {
    props.checkNetwork();
    event.preventDefault();
    const fromTokenId = event.target.fromToken.value;
    const toTokenId = event.target.toToken.value;
    if (fromTokenId < 0 || fromTokenId > 2 || toTokenId < 0 || toTokenId > 2) {
      // display error message if tokenIds are not between 0 and 2
      setModalProps(true,"Error!","Token IDs must be between 0 and 2");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("TransferFrom: " +fromTokenId +" to " + toTokenId);
      const forgeTokenContract = new ethers.Contract(
        props.forgeTokenAddress,
        ForgeTokenABI,
        signer
      );
      setLoadModalShow(true);
      const tx = await forgeTokenContract.tradeToken(fromTokenId, toTokenId);
      await tx.wait();
      setLoadModalShow(false);
      setModalProps(true,"Success!","Traded successfully!");
    } catch (error) {
      console.log(error);
      setLoadModalShow(false);
      setModalProps(true,"Error!",error.data.message);
    }
  };
  return (
    <>
      <Card style={{ width: "50%",marginTop: "5%", marginLeft: "auto", marginRight: "auto" }}>
      <Card.Header>Trade Tokens</Card.Header>
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
        <LoadingModal show={loadModalShow} title={"Please wait"} message={"Trading transaction in progress"} />
      </>
  )
}

export default TradeToken