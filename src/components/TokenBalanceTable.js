import React, { useState} from "react";
import { ethers } from "ethers";
import { Card, Table, Button, Form } from "react-bootstrap";

import ForgeTokenABI from "../abis/forgeTokenABI.json";
import TokenABI from "../abis/tokenABI.json";
import TradeToken from "./TradeToken";
import ErrorModal from "./ErrorModal";
import LoadingModal from "./LoadingModal";

const forgeTokenAddress = ""; // Forge contract address
const erc1155Address = ""; // ERC1155 contract address

const TokenBalanceTable = () => {
  const [balances, setBalances] = useState([]);
  const [signerAddress, setSignerAddress] =useState('');
  const [maticBalance, setMaticBalance] = useState(0);

  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadModalShow, setLoadModalShow] = useState(false);
 
  const checkNetwork = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    console.log("checkNetwork");
    if (network.chainId !== 80001) {
      try {
        setModalProps(true,"Wrong Network!", "Please switch to polygon network");
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{
            chainId: '0x13881',
          }]
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  const fetchAddress = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    setSignerAddress(await signer.getAddress());
  }
  
  const getMaticBalance = async ()=>{
    
    if (signerAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
    
      const balance = await provider.getBalance(signerAddress);
      setMaticBalance(ethers.utils.formatEther(balance));
    }
  }
  fetchAddress();
  getMaticBalance();
  const fetchBalances = async () => {
    checkNetwork();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(erc1155Address, TokenABI, provider);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("signerAddress : "+signerAddress);
    let addresses = [];
    let tokenIds = [];
    for (let i = 0; i < 7; i++) {
      addresses.push(signerAddress);
      tokenIds.push(i);
    }
    const newBalances  = await tokenContract.balanceOfBatch(addresses, tokenIds);
    setBalances(newBalances.map(balance => balance.toString()));
  };

  const handleMint = async (event) => {
    checkNetwork();
    event.preventDefault();
    const tokenId = event.target.tokenId.value;
    if (tokenId < 0 || tokenId > 6) {
      // display error message if tokenId is not between 0 and 6
      setModalProps(true,"Error!", "Token ID must be between 0 and 6");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const forgeTokenContract = new ethers.Contract(
        forgeTokenAddress,
        ForgeTokenABI,
        signer
      );
      setLoadModalShow(true);
      const tx = await forgeTokenContract.mintToken(tokenId);//note:this is where the transaction is prompted to confirm on metaMask extension
      await tx.wait();
      setLoadModalShow(false);
      setModalProps(true,"Success!", "Token minted successfully!");
    } catch (error) {
      console.log(error);
      setLoadModalShow(false);
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
    fetchBalances();
  }

  return (
    <>
      <Card style={{ width: "50%",marginTop: "5%" , marginLeft: "auto", marginRight: "auto"}}>
        <Card.Header>Token Details</Card.Header>
        <Card.Body>
          <Card.Title>Address of the User</Card.Title>
          <Card.Text>{signerAddress}</Card.Text>
          <Card.Title>MATIC Balance</Card.Title>
          <Card.Text>{maticBalance}</Card.Text>
          <Button onClick={fetchBalances}>Show Token Balance</Button>
          <Table striped bordered hover style={{marginTop: "5%" }}>
            <thead>
              <tr>
                <th>Token ID</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance, index) => (
                <tr key={index}>
                  <td>Token_{index}</td>
                  <td>{balance}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Card style={{ width: "50%",marginTop: "5%", marginLeft: "auto", marginRight: "auto" }}>
      <Card.Header>Forge Tokens</Card.Header>
      <Card.Body>
        <Form onSubmit={handleMint}>
          <Form.Group className="mb-3" controlId="tokenId" >
            <Form.Label>Token ID</Form.Label>
            <Form.Control type="number" min="0" max="10" required />
          </Form.Group >
          <Button type="submit">Mint</Button>
        </Form>
        </Card.Body>
      </Card>
      <TradeToken forgeTokenAddress={forgeTokenAddress} erc1155Address = {erc1155Address} 
        checkNetwork={checkNetwork} fetchBalances={fetchBalances} />
      <ErrorModal isOpen={isModalOpen} title={modalTitle} 
        message={modalMessage} closeHandler={closeHandler} />
      <LoadingModal show={loadModalShow} title={"Please wait"} 
        message={"Forging transaction in progress"} />
    </>
  );
};

export default TokenBalanceTable;
