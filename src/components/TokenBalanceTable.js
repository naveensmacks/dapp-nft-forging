import React, { useState } from "react";
import { ethers } from "ethers";
import { Card, Table, Button, Form } from "react-bootstrap";
import Modal from "react-modal";

import ForgeTokenABI from "../abis/forgeTokenABI.json";
import TokenABI from "../abis/tokenABI.json";

Modal.setAppElement("#root");

const forgeTokenAddress = "0xac746D93EBef438d47F7fe4E0081a955b7F42613"; // Forge contract address
const tokenAddress = "0xDFcaC9F177F78a699e5879568762f339D3c796AE"; // ERC1155 contract address
const provider = new ethers.providers.Web3Provider(window.ethereum);

const TokenBalanceTable = () => {
  const [balances, setBalances] = useState([]);
  const [signerAddress, setSignerAddress] =useState('');
 
  const fetchAddress = async() => {
    const signer = await provider.getSigner();
    setSignerAddress(await signer.getAddress());
  }
  fetchAddress(); 
  const fetchBalances = async () => {
    const tokenContract = new ethers.Contract(tokenAddress, TokenABI, provider);
    
   
    console.log("asa : "+typeof(signerAddress));
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
      setErrorModalMessage("Token ID must be between 0 and 6.");
      return;
    }
    try {
      const signer = await provider.getSigner();
      const forgeTokenContract = new ethers.Contract(
        forgeTokenAddress,
        ForgeTokenABI,
        signer
      );
      const tx = await forgeTokenContract.mintToken(tokenId);
      await tx.wait();
      setSuccessModalMessage("Token minted successfully!");
    } catch (error) {
      console.log(error);
      setErrorModalMessage(error.data.message);
    }
  };

  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [errorModalMessage, setErrorModalMessage] = useState("");

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
      <Modal
        isOpen={!!successModalMessage}
        onRequestClose={() => setSuccessModalMessage("")}
      >
        <h2>Success!</h2>
        <p>{successModalMessage}</p>
      </Modal>
      <Modal
        isOpen={!!errorModalMessage}
        onRequestClose={() => setErrorModalMessage("")}
      >
        <h2>Error</h2>
        <p>{errorModalMessage}</p>
      </Modal>
    </>
  );
};

export default TokenBalanceTable;
