import React, { useState } from "react";
import { ethers } from "ethers";
import { Card, Table, Button, Form } from "react-bootstrap";
import Modal from "react-modal";

import ForgeTokenABI from "../abis/forgeTokenABI.json";
import TokenABI from "../abis/tokenABI.json";
import TradeToken from "./TradeToken";
import ErrorModal from "./ErrorModal";

Modal.setAppElement("#root");

const forgeTokenAddress = "0xcf391634998A40E7cE99EdBE922AaCDfFC60de72"; // Forge contract address
const erc1155Address = "0xDb0ae0eBec43B755aFbcCF25d2a820E4d4D879E2"; // ERC1155 contract address
const provider = new ethers.providers.Web3Provider(window.ethereum);

const TokenBalanceTable = () => {
  const [balances, setBalances] = useState([]);
  const [signerAddress, setSignerAddress] =useState('');

  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const fetchAddress = async() => {
    const signer = await provider.getSigner();
    setSignerAddress(await signer.getAddress());
  }
  fetchAddress(); 
  const fetchBalances = async () => {
    const tokenContract = new ethers.Contract(erc1155Address, TokenABI, provider);
    
   
    console.log("asa : "+signerAddress);
    const newBalances = [];
    for (let i = 0; i < 7; i++) {
      console.log("inside loop: "+signerAddress);
      
      const balance = await tokenContract.balanceOf(signerAddress, i);
      newBalances.push(balance.toString());
    }
    setBalances(newBalances);
  };

  const handleMint = async (event) => {
    event.preventDefault();
    const tokenId = event.target.tokenId.value;
    if (tokenId < 0 || tokenId > 6) {
      // display error message if tokenId is not between 0 and 6
      setModalProps(true,"Error!", "Token ID must be between 0 and 6");
      return;
    }
    try {
      console.log("1");
      const signer = await provider.getSigner();
      console.log("2");
      const forgeTokenContract = new ethers.Contract(
        forgeTokenAddress,
        ForgeTokenABI,
        signer
      );
      console.log("3");
      const tx = await forgeTokenContract.mintToken(tokenId);//note:this is where the transaction is prompted to confirm on metaMask extension
      console.log("4");
      await tx.wait();
      console.log("5");
      setModalProps(true,"Success!", "Token minted successfully!");
    } catch (error) {
      console.log(error);
      setModalProps(true,"Error!", error.data.message)
    }
  };
  const setModalProps = (isOpen, title, message) => {
    setIsModalOpen(isOpen);
    setModalTitle(title);
    setModalMessage(message);
  };

  const closeHandler =()=> {
    setIsModalOpen(false);
  }

  return (
    <>
      <Card style={{ width: "50%",marginTop: "5%" , marginLeft: "auto", marginRight: "auto"}}>
        <Card.Header>Token Details</Card.Header>
        <Card.Body>
          <Card.Title>Address of the User</Card.Title>
          <Card.Text>{signerAddress}</Card.Text>
          <Button onClick={fetchBalances}>Show Token Balance</Button>
          <Table striped bordered hover style={{marginTop: "5%" }}>
            <thead>
              <tr>
                <th>Tokens</th>
                {balances.map((balance, index) => (
                  <th key={index}>Token_{index}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Balances</th>
                {balances.map((balance,index) => (
                  <td key={index}>{balance}</td>
                ))}
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Card style={{ width: "50%",marginTop: "5%", marginLeft: "auto", marginRight: "auto" }}>
      <Card.Body>
        <Form onSubmit={handleMint}>
          <Form.Group className="mb-3" controlId="tokenId" >
            <Form.Label>Token ID</Form.Label>
            <Form.Control type="number" min="0" max="6" required />
          </Form.Group >
          <Button type="submit">Mint</Button>
        </Form>
        </Card.Body>
      </Card>
      <TradeToken forgeTokenAddress={forgeTokenAddress} erc1155Address = {erc1155Address} provider={provider} />
      <ErrorModal isOpen={isModalOpen} title={modalTitle} message={modalMessage} closeHandler={closeHandler} />
    </>
  );
};

export default TokenBalanceTable;
