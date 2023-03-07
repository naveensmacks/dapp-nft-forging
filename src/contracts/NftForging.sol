// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC1155 is ERC1155, Ownable {
       address public authAddress;
    
    constructor() ERC1155("") {
    }

    function setAuthAddress(address _authAddress) public onlyOwner{
        require(_authAddress == address(0), "AuthAddress is already set");
        authAddress=_authAddress;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    modifier authority() {
        require(authAddress != address(0),"AuthAddress is not set yet");
        require(msg.sender == authAddress,"Does not have authority to perform the action");
        _;
    }

    //making sure only the ForgeToken contract address can have access to the below two methods
    function mintToken(address to, uint256 tokenId,uint256 amount) public authority{
        _mint(to, tokenId, amount, "");
    }

    function burnToken(address to, uint256 tokenId, uint256 amount) public authority{
        _burn(to, tokenId, amount);
    }

    //make sure other unused external/public are protected from external usage
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override onlyOwner{
        super.safeBatchTransferFrom(from,to,ids,amounts,data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override onlyOwner{
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function setApprovalForAll(address operator, bool approved) public override onlyOwner{
        super.setApprovalForAll(operator, approved);
    }

}

contract ForgeToken {
    MyERC1155 public erc1155;
    mapping(uint256 => uint256) public cooldownUntil;

    uint256 constant private TOKEN_0 = 0;
    uint256 constant private TOKEN_1 = 1;
    uint256 constant private TOKEN_2 = 2;
    uint256 constant private TOKEN_3 = 3;
    uint256 constant private TOKEN_4 = 4;
    uint256 constant private TOKEN_5 = 5;
    uint256 constant private TOKEN_6 = 6;

    constructor(address erc1155Address) {
        erc1155 = MyERC1155(erc1155Address);
    }

    function mintToken(uint256 tokenId) public {
        if(tokenId <= 2) {
            mintSmallTokens(tokenId);
        } else if(tokenId==3) {
            mintToken3();
        } else if(tokenId==4) {
            mintToken4();
        } else if(tokenId==5) {
            mintToken5();
        } else if(tokenId==6) {
            mintToken6();
        } else {
           require(true, "Invalid token ID"); 
        }
    }

    function mintSmallTokens(uint256 tokenId) private {
        require(block.timestamp >= cooldownUntil[tokenId], "Mint cooldown");
        erc1155.mintToken(msg.sender, tokenId, 1);
        cooldownUntil[tokenId] = block.timestamp + 1 minutes;
    }

    function mintToken3() private {
        require(erc1155.balanceOf(msg.sender, TOKEN_0) >= 1, "Not enough token_0");
        require(erc1155.balanceOf(msg.sender, TOKEN_1) >= 1, "Not enough token_1");

        // Burn token 0 and token 1 to mint token 3
        erc1155.burnToken(msg.sender, TOKEN_0, 1);
        erc1155.burnToken(msg.sender, TOKEN_1, 1);
        erc1155.mintToken(msg.sender, TOKEN_3, 1);
    }

    function mintToken4() private {
        require(erc1155.balanceOf(msg.sender, TOKEN_1) >= 1, "Not enough token_1");
        require(erc1155.balanceOf(msg.sender, TOKEN_2) >= 1, "Not enough token_2");

        // Burn token 1 and token 2 to mint token 4
        erc1155.burnToken(msg.sender, TOKEN_1, 1);
        erc1155.burnToken(msg.sender, TOKEN_2, 1);

        erc1155.mintToken(msg.sender, TOKEN_4, 1);
    }

    function mintToken5() private {
        require(erc1155.balanceOf(msg.sender, TOKEN_0) >= 1, "Not enough token_0");
        require(erc1155.balanceOf(msg.sender, TOKEN_2) >= 1, "Not enough token_2");

        // Burn token 0 and token 2 to mint token 5

        erc1155.burnToken(msg.sender, TOKEN_0, 1);
        erc1155.burnToken(msg.sender, TOKEN_2, 1);
        
        erc1155.mintToken(msg.sender, TOKEN_5, 1);
    }
    
    function mintToken6() private {
        require(erc1155.balanceOf(msg.sender, TOKEN_0) >= 1, "Not enough token_0");
        require(erc1155.balanceOf(msg.sender, TOKEN_1) >= 1, "Not enough token_1");
        require(erc1155.balanceOf(msg.sender, TOKEN_2) >= 1, "Not enough token_2");
        
        erc1155.burnToken(msg.sender, TOKEN_0, 1);
        erc1155.burnToken(msg.sender, TOKEN_1, 1);
        erc1155.burnToken(msg.sender, TOKEN_2, 1);
        
        erc1155.mintToken(msg.sender, TOKEN_6, 1);
    }
    
    function tradeToken(uint256 _fromTokenId, uint256 _toTokenId) public {

        require(_fromTokenId >= TOKEN_0 && _fromTokenId <= TOKEN_2, "Invalid token id");
        require(_toTokenId >= TOKEN_0 && _toTokenId <= TOKEN_2, "Invalid token id");
        require(erc1155.balanceOf(msg.sender, _fromTokenId) > 0, "You dont have enough tokens to trade");
        
        erc1155.burnToken(msg.sender, _fromTokenId, 1);
        erc1155.mintToken(msg.sender, _toTokenId, 1);
    }
}