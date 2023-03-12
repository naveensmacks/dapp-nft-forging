const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyERC1155 and ForgeToken contracts", function () {
  let erc1155;
  let forgeToken;

  beforeEach(async () => {
    const MyERC1155 = await ethers.getContractFactory("MyERC1155");
    erc1155= await MyERC1155.deploy();
    await erc1155.deployed();

    const ForgeToken = await ethers.getContractFactory("ForgeToken");
    forgeToken = await ForgeToken.deploy(erc1155.address);
    await forgeToken.deployed();
    await erc1155.setAuthAddress(forgeToken.address);
    [owner, user1] = await ethers.getSigners();
  });

  describe("MyERC1155 ", function () {
    it("Should set the authAddress correctly", async function () {
      expect(await erc1155.authAddress()).to.equal(forgeToken.address);
    });

    it("Should not set the authAddress when its already set", async function () {
      expect(await erc1155.authAddress()).to.equal(forgeToken.address);
      await expect(erc1155.setAuthAddress(forgeToken.address)).to.be.rejectedWith("AuthAddress is already set");
    });

    it("Should not set the authAddress when when called by other than owner", async function () {
      const MyERC1155 = await ethers.getContractFactory("MyERC1155");
      erc= await MyERC1155.deploy();
      await erc.deployed();

      const ForgeToken = await ethers.getContractFactory("ForgeToken");
      ft = await ForgeToken.deploy(erc1155.address);
      await ft.deployed();
      [owner, user1] = await ethers.getSigners();
      await expect(erc.connect(user1).setAuthAddress(forgeToken.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should set the URI correctly", async function () {
      const newURI = "https://example.com/";
      await erc1155.setURI(newURI);
      expect(await erc1155.uri(0)).to.equal(newURI.concat("0.json"));
    });

    it("Should not set the URI when called by other than owner", async function () {
      const newURI = "https://example.com/";
      await expect(erc1155.connect(user1).setURI(newURI)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not mint tokens when called other than Authority", async function() {
      await expect(erc1155.connect(user1).mintToken(user1.address, 0, 1)).to.be.revertedWith("Does not have authority");
    });

    it("Should not burn tokens when called other than Authority", async function() {
      await expect(erc1155.connect(user1).burnToken(user1.address, 0, 1)).to.be.revertedWith("Does not have authority");
    });

    it("Should not mint tokens when called without setting authority", async function() {
      const MyERC1155 = await ethers.getContractFactory("MyERC1155");
      erc= await MyERC1155.deploy();
      await erc.deployed();

      const ForgeToken = await ethers.getContractFactory("ForgeToken");
      ft = await ForgeToken.deploy(erc1155.address);
      await ft.deployed();
      [owner, user1] = await ethers.getSigners();
      await expect(erc.connect(user1).mintToken(user1.address, 0, 1)).to.be.revertedWith("AuthAddress is not set yet");
    });

    it("Should not access method safeBatchTransferFrom", async function() {
      await expect(erc1155.safeBatchTransferFrom(user1.address, user1.address, [], [], 0)).to.be.revertedWith("Access Prohibited");
    });

    it("Should not access method safeTransferFrom", async function() {
      await expect(erc1155.safeTransferFrom(user1.address, user1.address, 0, 0, 0)).to.be.revertedWith("Access Prohibited");
    });

    it("Should not access method setApprovalForAll", async function() {
      await expect(erc1155.setApprovalForAll(user1.address, true)).to.be.revertedWith("Access Prohibited");
    });
  });

  const mintSmallTokens = async (tokenId)=>{
    await expect(forgeToken.connect(user1).mintToken(tokenId))
          .to.emit(erc1155, "TransferSingle")
          .withArgs(forgeToken.address, ethers.constants.AddressZero, user1.address, tokenId, 1);

        // Check that user1 now has one tokenId
        expect(await erc1155.balanceOf(user1.address, tokenId)).to.equal(ethers.BigNumber.from("1"));

        // Try to mint tokenId again before the cooldown period is over
        await expect(forgeToken.connect(user1).mintToken(0)).to.be.revertedWith("Mint cooldown");

        // Wait for the cooldown period to pass
        await ethers.provider.send("evm_increaseTime", [60]);

        // Mint tokenId again
        await expect(forgeToken.connect(user1).mintToken(tokenId))
          .to.emit(erc1155, "TransferSingle")
          .withArgs(forgeToken.address, ethers.constants.AddressZero, user1.address, tokenId, 1);

        // Check that user1 now has one tokenId
        expect(await erc1155.balanceOf(user1.address, tokenId)).to.equal(ethers.BigNumber.from("2"));
  };

  describe("ForgeToken ", function () {
    describe("Mint Tokens", function() {
      it("Should mint token 0", async function() {
        // Mint token 0 for user1
        mintSmallTokens(0);
      });

      it("Should mint token 1", async function() {
        // Mint token 1 for user1
        mintSmallTokens(1);
      });

      it("Should mint token 2", async function() {
        // Mint token 2 for user1
        mintSmallTokens(2);
      });

      it("Should mint token 3", async function() {
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(1);
        // Check that user1 now has one token 1
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(3);
        // Check that user1 now has one token 3
        expect(await erc1155.balanceOf(user1.address, 3)).to.equal(ethers.BigNumber.from("1"));

        // After token 3 is forged token 0 and 1 should be burned
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should not mint token 3 when balance of token 0 or token 1 is Zero", async function() {
        await expect(forgeToken.connect(user1).mintToken(3)).to.be.revertedWith("Not enough token_0");
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await expect(forgeToken.connect(user1).mintToken(3)).to.be.revertedWith("Not enough token_1");
        expect(await erc1155.balanceOf(user1.address, 3)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should mint token 4", async function() {
        await forgeToken.connect(user1).mintToken(1);
        // Check that user1 now has one token 1
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(2);
        // Check that user1 now has one token 2
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(4);
        // Check that user1 now has one token 4
        expect(await erc1155.balanceOf(user1.address, 4)).to.equal(ethers.BigNumber.from("1"));

        // After token 4 is forged token 2 and 1 should be burned
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should not mint token 4 when balance of token 1 or token 2 is Zero", async function() {
        await expect(forgeToken.connect(user1).mintToken(4)).to.be.revertedWith("Not enough token_1");
        await forgeToken.connect(user1).mintToken(1);
        // Check that user1 now has one token 1
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("1"));
        await expect(forgeToken.connect(user1).mintToken(4)).to.be.revertedWith("Not enough token_2");
        expect(await erc1155.balanceOf(user1.address, 4)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should mint token 5", async function() {
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(2);
        // Check that user1 now has one token 2
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(5);
        // Check that user1 now has one token 5
        expect(await erc1155.balanceOf(user1.address, 5)).to.equal(ethers.BigNumber.from("1"));

        // After token 5 is forged token 0 and 2 should be burned
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should not mint token 5 when balance of token 0 or token 2 is Zero", async function() {
        await expect(forgeToken.connect(user1).mintToken(5)).to.be.revertedWith("Not enough token_0");
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await expect(forgeToken.connect(user1).mintToken(5)).to.be.revertedWith("Not enough token_2");
        expect(await erc1155.balanceOf(user1.address, 5)).to.equal(ethers.BigNumber.from("0"));
      });


      it("Should mint token 6", async function() {
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(1);
        // Check that user1 now has one token 1
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(2);
        // Check that user1 now has one token 2
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(6);
        // Check that user1 now has one token 6
        expect(await erc1155.balanceOf(user1.address, 6)).to.equal(ethers.BigNumber.from("1"));

        // After token 6 is forged token 0,1 and 2 should be burned
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should not mint token 6 when balance of token 0 or token 1 or token 2 is Zero", async function() {
        await expect(forgeToken.connect(user1).mintToken(6)).to.be.revertedWith("Not enough token_0");
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await expect(forgeToken.connect(user1).mintToken(6)).to.be.revertedWith("Not enough token_1");
        await forgeToken.connect(user1).mintToken(1);
        // Check that user1 now has one token 1
        expect(await erc1155.balanceOf(user1.address, 1)).to.equal(ethers.BigNumber.from("1"));
        await expect(forgeToken.connect(user1).mintToken(6)).to.be.revertedWith("Not enough token_2");
        expect(await erc1155.balanceOf(user1.address, 6)).to.equal(ethers.BigNumber.from("0"));
      });

      it("Should not mint Invalid token id", async function() {
        await expect(forgeToken.connect(user1).mintToken(77)).to.be.revertedWith("Invalid token ID");
        console.log(await erc1155.balanceOf(user1.address, 7));
      });
    });

    describe("Trade Tokens", function() {
      it("Should not trade invalid fromTokenId", async function() {
        await expect(forgeToken.connect(user1).tradeToken(7, 2)).to.be.revertedWith("Invalid token From token id");
      });
      it("Should not trade toTokenId greater than two", async function() {
        await expect(forgeToken.connect(user1).tradeToken(0, 3)).to.be.revertedWith("Invalid To token id");
      });
      it("Should not trade when you dont have enough tokens", async function() {
        await expect(forgeToken.connect(user1).tradeToken(0, 2)).to.be.revertedWith("You dont have enough tokens");
      });
      it("Should Trade token from 0-3 to 0-2", async function() {
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).tradeToken(0, 2);
        // check balance after trade
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("1"));
      });
      it("Should not Trade token from 4-6 to nothing(just burns)", async function() {
        await forgeToken.connect(user1).mintToken(0);
        // Check that user1 now has one token 0
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(2);
        // Check that user1 now has one token 2
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("1"));
        await forgeToken.connect(user1).mintToken(5);
        // Check that user1 now has one token 5
        expect(await erc1155.balanceOf(user1.address, 5)).to.equal(ethers.BigNumber.from("1"));

        // After token 5 is forged token 0 and 2 should be burned
        expect(await erc1155.balanceOf(user1.address, 0)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("0"));

        await forgeToken.connect(user1).tradeToken(5, 2);
        expect(await erc1155.balanceOf(user1.address, 5)).to.equal(ethers.BigNumber.from("0"));
        expect(await erc1155.balanceOf(user1.address, 2)).to.equal(ethers.BigNumber.from("0"));
      });
    });
  });
});
