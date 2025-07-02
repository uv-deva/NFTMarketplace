const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
require("@nomiclabs/hardhat-truffle5");



describe("NFT Marketplace", function () {
    var proxyinstance;
    var nft721instace;
    var nft1155instance;
    var tradeinstance;
    var tokenInstance;
    const nonce_ownersignature = 1; 
    const nonce_ownersignature_1 = 2;
    const nonce_sellersignature = 3;
    const nonce_buyersignature_exe = 4;
    const amount = 1000;
    let qty = 1;
    var tokenId;
    var v;
    var r;
    var s;
    var v1;
    var s1;
    var r1;
    var sellersign_v;
    var sellersign_r;
    var sellersign_s;
    var v_buyer_exec;
    var r_buyer_exec;
    var s_buyer_exec;

    it("Should return the new greeting once it's changed", async function () {
      const [owner,user1,user2] = await ethers.getSigners();
      const nft721tokenName = "NexityNFT721";
      const nft721tokenSymbol = "NFT721";
      const nft1155tokenName = "NexityNFT721";
      const nft1155tokenSymbol = "NFT1155";
      const buyerFee = 25;
      const sellerFee  = 25;
      const tokenURIPrefix = "https://gateway.pinata.cloud/ipfs/";
      const Proxy = await ethers.getContractFactory("TransferProxy");
      proxyinstance = await Proxy.deploy();
      await proxyinstance.deployed();
      const NFT721 = await ethers.getContractFactory("NFT");
      nft721instace = await NFT721.deploy(nft721tokenName,nft721tokenSymbol,tokenURIPrefix);
      await nft721instace.deployed();
      const NFT1155 = await ethers.getContractFactory("NFT1155");
      nft1155instance = await NFT1155.deploy(nft1155tokenName,nft1155tokenSymbol,tokenURIPrefix);
      await nft1155instance.deployed();
      const Trade = await ethers.getContractFactory("Trade");
      tradeinstance = await Trade.deploy(buyerFee,sellerFee,proxyinstance.address);
      await tradeinstance.deployed();
      await proxyinstance.changeOperator(tradeinstance.address)
      const Token = await ethers.getContractFactory("mockToken");
      tokenInstance = await Token.deploy(owner.address,"test","TET");
      await tokenInstance.deployed();

      console.log("tokenInstance",tokenInstance.address)
      console.log("proxyinstance",proxyinstance.address)
      console.log("nft721instace",nft721instace.address)
      console.log("nft1155instance",nft1155instance.address)
      console.log("tradeinstance",tradeinstance.address)

    });

    it(`setApproval Functionality for erc721`,async()=>{
      const [owner,user1,user2] = await ethers.getSigners();
      await nft721instace.connect(user1).setApprovalForAll(proxyinstance.address, true)
    })

    it(`OwnerSignature`,async()=> {
    const [owner,user1,user2] = await ethers.getSigners();
    const uri = "sample1";
    var tokenhash = await ethers.utils.solidityKeccak256(["address", "address", "string", "uint256"],[nft721instace.address, user1.address, uri, nonce_ownersignature]);
    var arrayify =  await ethers.utils.arrayify(tokenhash);
    var tokensignature = await owner.signMessage(arrayify);
    var splitSign = await ethers.utils.splitSignature(tokensignature)
    v = splitSign.v
    r = splitSign.r
    s = splitSign.s
    })

    it(`Mint functionality`,async()=>{
      const [owner,user1,user2] = await ethers.getSigners();
      const uri = "sample1";
      const royaltyfee = 5
      let mint = await nft721instace.connect(user1).mint(uri, royaltyfee, [v,r,s,nonce_ownersignature])
      let mint_wait = await mint.wait()
      let from_address = mint_wait.events[0].args[0];
      let to_address = mint_wait.events[0].args[1];
      tokenId = mint_wait.events[0].args[2];

    })
    
    // it(`Revert condition - Mint functionality - Owner sign verification failed`,async()=>{
    //   const [owner,user1,user2] = await ethers.getSigners();
    //   const uri = "sample1";
    //   const royaltyfee = 5 
    //   await expectRevert(nft721instace.connect(owner).mint(uri, royaltyfee, [v,r,s,nonce_ownersignature_1]),'Owner sign verification failed')
    // })

    it(`Checking tokenId after minted`,async()=>{
      let tokenId_aftermint = 0
      expect(Number(tokenId)).equal(tokenId_aftermint);
    })

    it(`Seller sign for buyAsset`,async()=>{
      const [owner,user1,user2] = await ethers.getSigners();
      const uri = "sample1";
      var tokenhash = await ethers.utils.solidityKeccak256(["address", "uint256", "address", "uint256" , "uint256"],[nft721instace.address, tokenId ,tokenInstance.address, amount, nonce_sellersignature]);
      var arrayify =  await ethers.utils.arrayify(tokenhash);
      var tokensignature = await user1.signMessage(arrayify);
      var splitSign = await ethers.utils.splitSignature(tokensignature)
      sellersign_v = splitSign.v
      sellersign_r = splitSign.r
      sellersign_s = splitSign.s
    })

    it(`setApproval Functionality for erc721`,async()=>{
      const [owner,user1,user2] = await ethers.getSigners();
      await nft721instace.connect(user2).setApprovalForAll(proxyinstance.address, true)
    })

    it(`Transfer Function`,async()=>{
      const [owner,user1,user2] = await ethers.getSigners();
      let to_address = user2.address
      let amount = 1025
      await tokenInstance.connect(owner).transfer(to_address,amount)
      await tokenInstance.connect(user2).approve(proxyinstance.address,amount)
    })

  //   it(`Buying Asset by the User`,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   let seller = user1.address
  //   let buyer = user2.address
  //   let erc20Address = tokenInstance.address
  //   let nftAddress = nft721instace.address
  //   let nftType = 0
  //   let unitPrice = 1000
  //   let amount = 1025
  //   let tokenId = 0
  //   let qty = 1
  //   await tradeinstance.connect(user2).buyAsset([seller,buyer,erc20Address,nftAddress,nftType,unitPrice,amount,tokenId,qty],[sellersign_v,sellersign_r,sellersign_s,nonce_sellersignature])
  // })

  it(`buyerSignature_ExecuteBid`,async()=>{
    const [owner,user1,user2] = await ethers.getSigners();
    let tokenId = 0
    let amount = 1025
    let qty = 1
    await tokenInstance.connect(owner).transfer(user1.address,amount)
    await tokenInstance.connect(user1).approve(proxyinstance.address,amount)
    const uri = "sample1";
    var tokenhash = await ethers.utils.solidityKeccak256(["address", "uint256", "address", "uint256","uint256","uint256"],[nft721instace.address, tokenId ,tokenInstance.address, amount, qty ,nonce_buyersignature_exe]);
    var arrayify =  await ethers.utils.arrayify(tokenhash);
    var tokensignature = await user1.signMessage(arrayify);
    var splitSign = await ethers.utils.splitSignature(tokensignature)
    v_buyer_exec = splitSign.v
    r_buyer_exec = splitSign.r
    s_buyer_exec = splitSign.s
  })

  // it(`Executing bid Revert - Checking : 'Nonce : Invalid Nonce'`,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   let tokenId = 1
  //   let seller = user2.address
  //   let buyer = user1.address
  //   let erc20Address = tokenInstance.address
  //   let nftAddress = nft721instace.address
  //   let nftType = 1
  //   let unitPrice = 1000
  //   let amount = 1025
  //   let qty = 1
  //   await expectRevert(tradeinstance.connect(user2).executeBid([seller,buyer,erc20Address,nftAddress,nftType,unitPrice,amount,tokenId,qty],[v_buyer_exec,r_buyer_exec,s_buyer_exec,nonce_sellersignature]),"Nonce : Invalid Nonce") 
  // })

  // it(`Executing bid Revert - Checking : 'buyer sign verification failed'`,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   let temp_nonce = 5
  //   let tokenId = 1
  //   let seller = user2.address
  //   let buyer = user1.address
  //   let erc20Address = tokenInstance.address
  //   let nftAddress = nft721instace.address
  //   let nftType = 1
  //   let unitPrice = 1000
  //   let amount = 1025
  //   let qty = 1
  //   await expectRevert(tradeinstance.connect(user2).executeBid([seller,buyer,erc20Address,nftAddress,nftType,unitPrice,amount,tokenId,qty],[v_buyer_exec,r_buyer_exec,s_buyer_exec,temp_nonce]),"buyer sign verification failed") 
  // })

  it(`Transferring tokens to the buyer`,async()=>{
    const [owner,user1,user2] = await ethers.getSigners();
    let amount = 1025
    await tokenInstance.connect(owner).transfer(user1.address,amount)
    await tokenInstance.connect(user1).approve(proxyinstance.address,amount)
  })

  // it(`Executing bid by the User `,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   let tokenId = 1
  //   let seller = user2.address
  //   let buyer = user1.address
  //   let erc20Address = tokenInstance.address
  //   let nftAddress = nft721instace.address
  //   let nftType = 1
  //   let unitPrice = 1000
  //   let amount = 1025
  //   let qty = 1
  //   await tradeinstance.connect(user2).executeBid([seller,buyer,erc20Address,nftAddress,nftType,unitPrice,amount,tokenId,qty],[v_buyer_exec,r_buyer_exec,s_buyer_exec,nonce_buyersignature_exe])
  // })

  // it(`setApproval Functionality for erc1155`,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   await nft1155instance.connect(user1).setApprovalForAll(proxyinstance.address, true)
  // })

  it(`OwnerSignature for ERC1155`,async()=> {
    const [owner,user1,user2] = await ethers.getSigners();
    const uri = "sample1";
    var tokenhash = await ethers.utils.solidityKeccak256(["address", "address", "string", "uint256"],[nft1155instance.address, user1.address, uri, nonce_ownersignature]);
    var arrayify =  await ethers.utils.arrayify(tokenhash);
    var tokensignature = await owner.signMessage(arrayify);
    var splitSign = await ethers.utils.splitSignature(tokensignature)
    v = splitSign.v
    r = splitSign.r
    s = splitSign.s
  })

  it(`Mint functionality for ERC1155`,async()=>{
    const [owner,user1,user2] = await ethers.getSigners();
    const uri = "sample1";
    const royaltyfee = 5
    const supply = 1
    let mint = await nft1155instance.connect(user1).mint(uri, supply ,royaltyfee, [v,r,s,nonce_ownersignature])
    let mint_wait = await mint.wait()
    let from_address = mint_wait.events[0].args[0];
    let to_address = mint_wait.events[0].args[1];
    tokenId = mint_wait.events[0].args[2];
  })

  // it(`Revert condition - Mint functionality - Owner sign verification failed`,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   const uri = "sample1";
  //   const royaltyfee = 5 
  //   const supply = 1
  //   await expectRevert(nft1155instance.connect(owner).mint(uri, supply , royaltyfee, [v,r,s,nonce_ownersignature_1]), 'Owner sign verification failed')
  // })

  it(`Transfer Function`,async()=>{
    const [owner,user1,user2] = await ethers.getSigners();
    let to_address = user1.address
    let amount = 1025
    await tokenInstance.connect(owner).transfer(to_address,amount)
    await tokenInstance.connect(user1).approve(proxyinstance.address,amount)
  })

  it(`buyerSignature_ExecuteBid`,async()=>{
    const [owner,user1,user2] = await ethers.getSigners();
    let tokenId = 1
    let amount = 1025
    let qty = 1
    await tokenInstance.connect(owner).transfer(user1.address,amount)
    await tokenInstance.connect(user1).approve(proxyinstance.address,amount)
    const uri = "sample1";
    var tokenhash = await ethers.utils.solidityKeccak256(["address", "uint256", "address", "uint256","uint256","uint256"],[nft1155instance.address, tokenId ,tokenInstance.address, amount, qty ,nonce_buyersignature_exe]);
    var arrayify =  await ethers.utils.arrayify(tokenhash);
    var tokensignature = await user1.signMessage(arrayify);
    var splitSign = await ethers.utils.splitSignature(tokensignature)
    var v1 = splitSign.v
    var r1 = splitSign.r
    var s1 = splitSign.s
  })

  // it(`Buying Asset by the User erc1155`,async()=>{
  //   const [owner,user1,user2] = await ethers.getSigners();
  //   let seller = user1.address
  //   let buyer = user2.address
  //   let erc20Address = tokenInstance.address
  //   let nftAddress = nft1155instance.address
  //   let nftType = 1
  //   let unitPrice = 1000
  //   let amount = 1025
  //   let tokenId = 1
  //   let qty = 1
  //   await tradeinstance.connect(user2).buyAsset([seller,buyer,erc20Address,nftAddress,nftType,unitPrice,amount,tokenId,qty],[v1,r1,s1,6])
  // })




});
