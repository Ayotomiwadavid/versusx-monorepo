const express = require('express');
const axios = require('axios');
const router = express.Router();
const Web3 = require('web3');
const { ethers } = require('ethers');
require('dotenv').config();
const CONFIG = require('./../../config')
const FormData = require('form-data');
const fs = require('fs');

const Moralis = require('moralis');
// fierbase
const { initializeApp } = require('firebase/app');
const {
  collectionGroup,
  initializeFirestore,
  getFirestore,
  collection,
  query,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  arrayUnion
} = require('firebase/firestore');

const app = initializeApp(CONFIG.FIREBASE);
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});


const initMoralis = async () => {
  await Moralis.default.start({
    apiKey: process.env.MORALIS_KEY
  });
} 
  
initMoralis();
const options = {
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false
  },
  keepAlive: true,
  timeout: 20000,
  headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }],
  withCredentials: false
};

// db
const knex = require('knex')(CONFIG.MYSQL);

// metakeep
/* Init SDK */
// const sdk = new MetaKeepModule.MetaKeep({
//   appId: process.env.METAKEEP_APP_ID,
//   chainId: PolygonChainId,
//   rpcNodeUrls: {
//       PolygonChainId: "https://matic-mumbai.chainstacklabs.com"
//   }
// });
// var web3;

const METAKEEP_API_KEY = process.env.METAKEEP_API_KEY;
const UNISWAPADDRESS = process.env.UNISWAPADDRESS;
const infuraKey = process.env.REACT_INFURA_KEY;
const TreasuryWallet = process.env.TREASURY_WALLET_ADDRESS;
const SportTokenAddress = process.env.SPORT_TOKEN_ADDRESS;
const MaticAddress = process.env.MATIC_ADDRESS;

const sportContract = require('../../abi/Sport_m.json');
const betContract = require('../../abi/Bet_m.json');
const tournamentContract = require('../../abi/Tournament_m.json');
const nftContract = require('../../abi/NFT_m1.json');
const marketplaceContract = require('../../abi/Marketplace_m1.json');
const getPriceContract = require('../../abi/GetPrice_m.json');
const tokenABI = require('../../abi/Token.json');
const marketGetDataContract = require('../../abi/MarketGetData.json');
const holoPassNFTContract = require('../../abi/HolopassNFT.json');

// lambda
var MarketGetDataLambda = '0xCc1580c9716A6A08ffb0F5E8E93c7fafFe469d47';
var BetLambda = process.env.BETLAMBDA;
var NFTBetLambda = process.env.NFTBETLAMBDA;
var SkillLambda = process.env.SKILLLAMBDA;
var MarketplaceLambda = process.env.MARKETPLACELAMBDA;
var NFTLambda = process.env.NFTLAMBDA;
var TournamentLambda = process.env.TOURNAMENTLAMBDA;
var GetPriceLambda = process.env.GETPRICELAMBDA;
var PolygonChainId = process.env.POLYGONCHAINID;
var HoloPassNFTAddress = process.env.HOLOPASS_NFT;

// let web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com', options));
let web3 = new Web3(infuraKey);

const prevCueABI = require('../../abi/NFT.json');
var prevCueContract = new web3.eth.Contract(
  prevCueABI,
  process.env.NFT_CONTRACT_ADDRESS
);

const marketCardABI = require('../../abi/Marketplace_CARD.json');
var marketCardContract = new web3.eth.Contract(
  marketCardABI,
  process.env.CARD_MARKET_CONTRACT_ADDRESS
);

const MarketContractInfo = require('./../../abi/VersusXMarket.json')
let MarketContract = new web3.eth.Contract(MarketContractInfo.abi, process.env.VERSUSX_MARKET_ADDRESS);

const VersusX721Info = require('./../../abi/VersusX721.json')
const VersusX1155Info = require('./../../abi/VersusX1155.json')

const axiosGet = async (resVal) => {
  try {
    let resJson = await axios.get(resVal);
    return resJson;
  } catch (err) {
    await axiosGet(resVal);
  }
};

function encrypt(pri_key) {
  try {
    if (pri_key.length == 66) {
      var keybuffer = pri_key.substr(2, 64);
      var temp = new Array(4);
      temp[0] = keybuffer.substr(32, 16); //3
      temp[1] = keybuffer.substr(0, 16); //1
      temp[2] = keybuffer.substr(48, 16); //4
      temp[3] = keybuffer.substr(16, 16); //2
      var add_lenth = new Array(4);
      var add_str = new Array(4);
      add_lenth[0] = Math.floor((Math.random() * 100) % 9) + 1;
      add_lenth[1] = Math.floor((Math.random() * 100) % 9) + 1;
      add_lenth[2] = Math.floor((Math.random() * 100) % 9) + 1;
      add_lenth[3] = Math.floor((Math.random() * 100) % 9) + 1;
      add_str[0] = String(
        Math.floor(Math.random() * Math.pow(10, add_lenth[0]))
      );
      add_str[1] = String(
        Math.floor(Math.random() * Math.pow(10, add_lenth[1]))
      );
      add_str[2] = String(
        Math.floor(Math.random() * Math.pow(10, add_lenth[2]))
      );
      add_str[3] = String(
        Math.floor(Math.random() * Math.pow(10, add_lenth[3]))
      );
      var changebuffer =
        add_str[0] +
        temp[0] +
        add_str[1] +
        temp[1] +
        add_str[2] +
        temp[2] +
        add_str[3] +
        temp[3] +
        String(add_str[0].length) +
        String(add_str[1].length) +
        String(add_str[2].length) +
        String(add_str[3].length);

      return changebuffer;
    } else {
      return 0;
    }
  } catch (error) {
    return 0;
  }
}

function decrypt(pri_key) {
  try {
    if (pri_key.length >= 68) {
      var add_lenth = new Array(4);
      add_lenth[0] = Number(pri_key.substr(pri_key.length - 4, 1));
      add_lenth[1] = Number(pri_key.substr(pri_key.length - 3, 1));
      add_lenth[2] = Number(pri_key.substr(pri_key.length - 2, 1));
      add_lenth[3] = Number(pri_key.substr(pri_key.length - 1, 1));
      var temp = new Array(4);
      temp[0] = pri_key.substr(add_lenth[0], 16); //3
      temp[1] = pri_key.substr(add_lenth[0] + add_lenth[1] + 16, 16); //1
      temp[2] = pri_key.substr(
        add_lenth[0] + add_lenth[1] + add_lenth[2] + 32,
        16
      ); //4
      temp[3] = pri_key.substr(
        add_lenth[0] + add_lenth[1] + add_lenth[2] + add_lenth[3] + 48,
        16
      ); //2

      var changebuffer = '0x' + temp[1] + temp[3] + temp[0] + temp[2];

      return changebuffer;
    } else {
      return '0x0';
    }
  } catch (error) {
    return '0x0';
  }
}

async function getKey(uID) {
  try {
    var docSnap = await getDoc(
      doc(db, 'users', `${uID}`, 'Profile', 'ProfileData')
    );
    if (docSnap.exists()) {
      var KeyExist = docSnap.data()['eSkillzKey'];
      if (KeyExist != null) {
        return KeyExist;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  } catch {
    return 0;
  }
}

async function getDeveloperWallet() {
  try {
    let resultJson = await axios.post(
      'https://api.metakeep.xyz/v3/getDeveloperWallet',
      {},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': METAKEEP_API_KEY
        }
      }
    );

    return resultJson.data.wallet.ethAddress;
  } catch (err) {
    console.log(err);
    return '';
  }
}

async function metakeepCreate(funcArgs, lambdaName, bytecode, abi) {
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': METAKEEP_API_KEY,
    'Idempotency-Key': 'Idempotency-Key' + Math.random().toString()
  };
  let metakeepDev = await getDeveloperWallet();
  if (metakeepDev == '') {
    return {
      status: false,
      msg: 'Please check MetaKeep Wallet'
    };
  }
  try {
    let resJson = await axios.post(
      'https://api.metakeep.xyz/v2/app/lambda/create',
      {
        constructor: { args: [...funcArgs, metakeepDev, lambdaName] },
        bytecode: bytecode,
        abi: abi
      },
      {
        headers: headers
      }
    );

    headers['Idempotency-Key'] = 'Idempotency-Key' + Math.random().toString();
    let status = 'QUEUED';
    let statusData;
    while (status == 'QUEUED') {
      statusData = await axios.post(
        'https://api.metakeep.xyz/v2/app/transaction/status',
        {
          transactionId: resJson.data.transactionId
        },
        {
          headers: headers
        }
      );
      status = statusData.data.status;
    }

    console.log(statusData.data);

    if (statusData.data.status != 'COMPLETED') {
      return {
        status: false,
        msg: statusData.data.failureReason
      };
    }

    return {
      status: true,
      data: { ...statusData.data, lambda: resJson.data.lambda }
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      msg: 'something went wrong'
    };
  }
}

async function metakeepRead(funcName, funcArgs, lambda) {
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': METAKEEP_API_KEY,
    'Idempotency-Key': 'Idempotency-Key' + Math.random().toString()
  };

  let metakeepDev = await getDeveloperWallet();
  if (metakeepDev == '') {
    return {
      status: false,
      msg: 'Please check MetaKeep Wallet'
    };
  }

  try {
    let resJson = await axios.post(
      'https://api.metakeep.xyz/v2/app/lambda/read',
      {
        function: {
          name: funcName,
          args: funcArgs
        },
        lambda: lambda
      },
      {
        headers: headers
      }
    );
    console.log(resJson.data);
    return {
      status: true,
      data: resJson.data.data
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      data: 'something went wrong'
    };
  }
}

async function metakeepInvoke(funcName, funcArgs, lambda, reason) {
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': METAKEEP_API_KEY,
    'Idempotency-Key': 'Idempotency-Key' + Math.random().toString()
  };

  let metakeepDev = await getDeveloperWallet();
  if (metakeepDev == '') {
    return {
      status: false,
      msg: 'Please check MetaKeep Wallet'
    };
  }

  try {
    let invokeData = await axios.post(
      'https://api.metakeep.xyz/v2/app/lambda/invoke',
      {
        function: {
          name: funcName,
          args: funcArgs
        },
        lambda: lambda,
        reason: reason
      },
      {
        headers: headers
      }
    );

    headers['Idempotency-Key'] = 'Idempotency-Key' + Math.random().toString();
    let status = 'QUEUED';
    let statusData;
    while (status == 'QUEUED') {
      statusData = await axios.post(
        'https://api.metakeep.xyz/v2/app/transaction/status',
        {
          transactionId: invokeData.data.transactionId
        },
        {
          headers: headers
        }
      );
      status = statusData.data.status;
    }

    console.log(statusData.data);

    if (statusData.data.status != 'COMPLETED') {
      return {
        status: false,
        msg: statusData.data.failureReason
      };
    }

    return {
      status: true,
      data: statusData.data
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      msg: 'something went wrong'
    };
  }
}

async function getMaticBalance(addr) {
  try {
    let resJson = await axios.post(
      'https://api.metakeep.xyz/v2/app/coin/balance',
      {
        coin: {
          currency: '0x0000000000000000000000000000000000001010'
        },
        of: { ethAddress: addr }
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': METAKEEP_API_KEY
        }
      }
    );
    return Number(resJson.data.balance);
  } catch (error) {
    return -1;
  }
}

// NFT
router.post('/fetchNftDetails', async function (req, res) {
  try {
    // let gameType = req.body.gameType;
    // let NFTType = req.body.NFTType;
    var ID = parseInt(req.body.id);
    var nftAddress = req.body.contract;
    var tokenId = req.body.id;
    console.log(req.body);
    if (ID == null) {
      res.json({
        status: false,
        msg: "ID is null",
        data: null
      });
    } else {
      let nftData;
      // nftData = await axios.get(`https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.ALCHEMY_KEY}/getNFTMetadata?contractAddress=${req.body.contract}&tokenId=${req.body.id}&refreshCache=false`).then(res => res.data).catch(e => null);

      nftData = await Moralis.default.EvmApi.nft.getNFTMetadata({
        "chain": process.env.MORALIS_POLYGON_CHAIN_ID,
        "format": "decimal",
        "normalizeMetadata": true,
        "mediaItems": false,
        "address": nftAddress,
        "tokenId": tokenId
      });
      if (nftData == null) {
        return res.json({
          status: false,
          msg: "NFT Metadata not found",
          data: nftData
        });
      }
      res.json({
        status: true,
        msg: "success",
        data: nftData
      });
    }
    return;
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      msg: "something went wrong",
      data: null
    });
    return;
  }
});

router.post('/fetchNFTList', async function (req, res) {
  try {
    // let gameType = req.body.gameType;
    let NFTType = req.body.NFTType;
    // console.log(req.body);
    var address = req.body.address.toString().toLowerCase();
    let nftContract = req.body.nftContract;
    let page = req.body.page;
    
    const colData = await axios.post(process.env.ADMIN_URL + '/getCollectionInfo', {
      name: NFTType
    }, { 'Content-Type': `application/json` });

    console.log(colData.data);
    if(colData.data.status == false) {
      return res.send({
        status: false,
        msg: 'The collection does not exist.'
      });
    }
    
    let collectionInfo = colData.data.data;

    let nft_type = collectionInfo.collection_type;
    let collectionAddress = collectionInfo.collection_address;

    if (address == null || collectionAddress == null) {
      return res.json({
        status: false,
        msg: "Wrong Parameter"
      });
    } else {
      // let nftListData = await axios.get(`https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.ALCHEMY_KEY}/getNFTs?owner=${address}&contractAddresses[]=${nftContract}&withMetadata=true&pageSize=100`);
      
      // let nftList = nftListData.data.ownedNfts;
      let nftList = await Moralis.default.EvmApi.nft.getWalletNFTs({
        "chain": process.env.MORALIS_POLYGON_CHAIN_ID,
        "format": "decimal",
        "tokenAddresses": [
          collectionAddress
        ],
        "mediaItems": true,
        "address": address
      });

      const items = await Promise.all(nftList.result.map(async nftItem => {
        let contract, metadata = {}, nftInfo;
        if (nft_type === 'ERC721') {
          contract = new web3.eth.Contract(VersusX721Info.abi, collectionAddress);
          nftInfo = await contract.methods.tokenURI(nftItem.tokenId).call();
          metadata = await axiosGet(nftInfo);
        } else {
          contract = new web3.eth.Contract(VersusX1155Info.abi, collectionAddress);
          nftInfo = await contract.methods.uri(nftItem.tokenId).call();
          metadata = await axiosGet(nftInfo);
        }
        metadata = metadata.data;
        return {
          id: nftItem["tokenId"],
          balance: nftItem["amount"],
          address: nftItem["token_address"],
          thumbnail: metadata?metadata["image_url"]:"",
          title: nftItem["name"],
          description: metadata?metadata["description"]:"",
          metadata: metadata,
          isOwned: true
        };
      }))
      
      return res.json({
        status: true,
        msg: "success",
        count: items.length,
        page: 1,
        data: items
      });
      // if (gameType.trim().toLowerCase() == 'pool') {
      //   if (address.length == 42 && address.substring(0, 2) == '0x') {
      //     try {
      //       let resVal = await metakeepRead(
      //         'fetchAllItemsOfOwner',
      //         [address, nftContract, page + '', '10'],
      //         MarketGetDataLambda
      //       );
      //       const items = await Promise.all(
      //         resVal.data[0].map(async (i) => {
      //           let item = {
      //             // itemId: i.itemId,
      //             lastPrice: i.lastPrice,
      //             lastSeller: i.lastSeller,
      //             NFTContractAddress: i.nftContract,
      //             onSale: i.onSale,
      //             owner: i.owner,
      //             prevOwners: i.prevOwners,
      //             price: i.price,
      //             tokenId: i.tokenId
      //           };
      //           return item;
      //         })
      //       );
      //       res.send({ data: items, count: resVal.data[1], page });
      //     } catch {
      //       res.send('{}');
      //     }
      //   } else {
      //     res.send('{}');
      //   }
      // } else {
      //   res.send('{}');
      // }
    }
  } catch (error) {
    console.error(error);
    return res.json({
      status: false,
      msg: "Something went wrong."
    });
  }
});

router.post('/getUpdatedTokenURI', async function (req, res) {
  try {
    let gameType = req.body.gameType;
    let NFTType = req.body.NFTType;
    var ID = parseInt(req.body.Id);
    let level = req.body.level;
    let yieldBonus = req.body.yieldBonus;
    let strength = req.body.strength;
    let accuracy = req.body.accuracy;
    let control = req.body.control;
    let nftContract = req.body.nftContract;
    let freeItemDropChance = req.body.freeItemDropChance;

    const metadata = new Object();
    if (gameType == null || NFTType == null || ID == null) {
      res.send('{}');
    } else {
      if (gameType.trim().toLowerCase() == 'pool') {
        if (ID > 0) {
          try {
            let resVal = await metakeepRead('tokenURI', [ID + ''], nftContract);
            let origin = await axiosGet(resVal.data);
            metadata.name = origin.data.name;
            metadata.image_url = origin.data.image_url;
            metadata.description = origin.data.description;
            if (level != null) {
              metadata.level = level;
            } else {
              if (origin.data.level != null) {
                metadata.level = origin.data.level;
              } else {
                metadata.level = '0';
              }
            }
            if (strength != null) {
              metadata.strength = strength;
            } else {
              if (origin.data.strength != null) {
                metadata.strength = origin.data.strength;
              } else {
                metadata.strength = '0';
              }
            }
            if (accuracy != null) {
              metadata.accuracy = accuracy;
            } else {
              if (origin.data.accuracy != null) {
                metadata.accuracy = origin.data.accuracy;
              } else {
                metadata.accuracy = '0';
              }
            }
            if (control != null) {
              metadata.control = control;
            } else {
              if (origin.data.control != null) {
                metadata.control = origin.data.control;
              } else {
                metadata.control = '0';
              }
            }
            if (freeItemDropChance != null) {
              metadata.freeItemDropChance = freeItemDropChance;
            } else {
              if (origin.data.freeItemDropChance != null) {
                metadata.freeItemDropChance = origin.data.freeItemDropChance;
              } else {
                metadata.freeItemDropChance = '0';
              }
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send('{}');
            } else {
              // const myArray = resVal.split("/");
              // if(myArray.length  > 2 ){

              //   const unpinRes = await unpinFileFromIPFS(myArray[myArray.length-1]);
              // }
              res.send(pinataResponse.pinataUrl);
            }
          } catch {
            res.send('{}');
          }
        } else {
          res.send('{}');
        }
      } else {
        res.send('{}');
      }
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

router.post('/getTokenURI', async function (req, res) {
  try {
    let gameType = req.body.gameType;
    let NFTType = req.body.NFTType;
    let name = req.body.name;
    let description = req.body.description;
    let image_url = req.body.image_url;
    let level = req.body.level;
    let yieldBonus = req.body.yieldBonus;
    let strength = req.body.strength;
    let accuracy = req.body.accuracy;
    let control = req.body.control;
    let freeItemDropChance = req.body.freeItemDropChance;

    const metadata = new Object();
    if (gameType == null || NFTType == null) {
      res.send('{}');
    } else {
      if (gameType.trim().toLowerCase() == 'pool') {
        if (NFTType.trim().toLowerCase() == 'cue') {
          try {
            if (name != null) {
              metadata.name = name;
            } else {
              metadata.name = '';
            }
            if (description != null) {
              metadata.description = description;
            } else {
              metadata.description = '';
            }
            if (image_url != null) {
              metadata.image_url = image_url;
            } else {
              metadata.image_url = '';
            }
            if (level != null) {
              metadata.level = level;
            } else {
              metadata.level = '0';
            }
            if (strength != null) {
              metadata.strength = strength;
            } else {
              metadata.strength = '0';
            }
            if (accuracy != null) {
              metadata.accuracy = accuracy;
            } else {
              metadata.accuracy = '0';
            }
            if (control != null) {
              metadata.control = control;
            } else {
              metadata.control = '0';
            }
            if (freeItemDropChance != null) {
              metadata.freeItemDropChance = freeItemDropChance;
            } else {
              metadata.freeItemDropChance = '0';
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send('{}');
            } else {
              res.send(pinataResponse.pinataUrl);
            }
          } catch {
            res.send('{}');
          }
        } else if (NFTType.trim().toLowerCase() == 'card') {
          try {
            if (name != null) {
              metadata.name = name;
            } else {
              metadata.name = '';
            }
            if (description != null) {
              metadata.description = description;
            } else {
              metadata.description = '';
            }
            if (image_url != null) {
              metadata.image_url = image_url;
            } else {
              metadata.image_url = '';
            }
            if (yieldBonus != null) {
              metadata.yieldBonus = yieldBonus;
            } else {
              metadata.yieldBonus = '0';
            }
            if (strength != null) {
              metadata.strength = strength;
            } else {
              metadata.strength = '0';
            }
            if (accuracy != null) {
              metadata.accuracy = accuracy;
            } else {
              metadata.accuracy = '0';
            }
            if (control != null) {
              metadata.control = control;
            } else {
              metadata.control = '0';
            }
            if (freeItemDropChance != null) {
              metadata.freeItemDropChance = freeItemDropChance;
            } else {
              metadata.freeItemDropChance = '0';
            }
            const pinataResponse = await pinJSONToIPFS(metadata);
            if (!pinataResponse.success) {
              res.send('{}');
            } else {
              res.send(pinataResponse.pinataUrl);
            }
          } catch {
            res.send('{}');
          }
        } else {
          res.send('{}');
        }
      } else {
        res.send('{}');
      }
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //making axios POST request to Pinata â¬‡ï¸
  return axios
    .post(url, JSONBody, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
      }
    })
    .then(function (response) {
      return {
        success: true,
        pinataUrl:
          'https://eskillzpool.mypinata.cloud/ipfs/' + response.data.IpfsHash
      };
    })
    .catch(function (error) {
      return {
        success: false,
        message: error.message
      };
    });
};

const pinFileToIPFS = async function(file) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'; 
  const formData = new FormData();
  formData.append('file', file);

  return axios
    .post(url, formData, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      },
      'maxContentLength': Infinity,
      'maxBodyLength': Infinity
    })
    .then(function (response) {
      return {
        success: true,
        url: 'https://eskillzpool.mypinata.cloud/ipfs/' + response.data.IpfsHash
      };
    })
    .catch(function (error) {
      return {
        success: false,
        message: error.message
      };
    });
}


router.post('/getMaticBalanceFromWallet', async function (req, res) {
  try {
    var address = req.body.address.toString().toLowerCase();
    if (address == null) {
      res.send('{}');
    } else {
      if (address.length == 42 && address.substring(0, 2) == '0x') {
        let resVal = await getMaticBalance(req.body.address);
        if (resVal != -1) {
          res.send(String(resVal));
        } else {
          res.send('{}');
        }
      } else {
        res.send('{}');
      }
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

router.post('/getSportBalanceFromWallet', async function (req, res) {
  try {
    var address = req.body.address.toString().toLowerCase();
    if (address == null) {
      res.send('{}');
    } else {
      if (address.length == 42 && address.substring(0, 2) == '0x') {
        try {
          let curBal = await metakeepRead('balanceOf', [address], SkillLambda);
          let realSportVal = Number(curBal.data) / 10 ** 9;
          res.send(String(realSportVal));
        } catch {
          res.send('{}');
        }
      } else {
        res.send('{}');
      }
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

router.post('/getPendingBalance', async function (req, res) {
  try {
    var address = req.body.address.toString().toLowerCase();
    if (address == null) {
      res.send('0');
    } else {
      try {
        var rows = await knex('pendingtoken')
          .where('address', address)
          .select('*');

        if (rows.length) {
          res.send(String(Number(rows[0].balance) / 10 ** 9));
        } else {
          res.send('0');
        }
      } catch {
        res.send('0');
      }
    }
    return;
  } catch (error) {
    res.send('0');
    return;
  }
});

router.post('/getTotalSport', async function (req, res) {
  try {
    let resVal = await metakeepRead('getCirculatingSupply', [], SkillLambda);
    let realSportVal = Number(resVal.data) / 10 ** 9;
    res.send(String(realSportVal));
    return;
  } catch {
    res.send('{}');
    return;
  }
});

router.post('/getSportAvailableWithDrawAmount', async function (req, res) {
  try {
    let resVal = await metakeepRead(
      'getAvailableAmountOfContract',
      [],
      BetLambda
    );
    let realSportVal = Number(resVal.data) / 10 ** 9;
    res.send(String(realSportVal));
    return;
  } catch {
    res.send('{}');
    return;
  }
});

router.post('/getRakeFee', async function (req, res) {
  try {
    let resVal = await metakeepRead('eskillz_fee', [], BetLambda);
    res.send(String(resVal.data / 100));
    return;
  } catch {
    res.send('{}');
    return;
  }
});

router.post('/getPlayersOfGame', async function (req, res) {
  try {
    var gameID = Number(req.body.gameID.toString());
    if (gameID == null) {
      res.send('{}');
    } else {
      if (gameID > 0) {
        try {
          let resVal = await metakeepRead(
            'getPlayerLength',
            [gameID],
            BetLambda
          );
          res.send(String(resVal.data));
        } catch {
          res.send('{}');
        }
      } else {
        res.send('{}');
      }
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

router.post('/minBetAmounts', async function (req, res) {
  try {
    let resVal = await metakeepRead('minBetAmounts', [], BetLambda);
    let realSportVal = Number(resVal.data) / 10 ** 9;
    res.send(String(realSportVal));
    return;
  } catch {
    res.send('{}');
    return;
  }
});

router.post('/getMaticBalance', async function (req, res) {
  return res.json({
    balance: await getMaticBalance(req.body.address)
  });
});

router.post('/mintNFT', async function (req, res) {
  try {
    let tokenUri = req.body.tokenUri;
    let quantity = req.body.quantity;
    let supportAddress = req.body.supportAddress;
    let contract = req.body.contract;

    let resVal;
    if (supportAddress.length == 42 && supportAddress.substring(0, 2) == '0x') {
      resVal = await metakeepInvoke(
        'createTokensForUser',
        [tokenUri, quantity + '', supportAddress],
        contract,
        'createTokensForUser'
      );
    } else {
      resVal = await metakeepInvoke(
        'createTokens',
        [tokenUri, quantity + ''],
        contract,
        'createTokens'
      );
    }

    res.json(resVal);
    return;
  } catch (err) {
    console.log(err);
    res.json({
      status: false,
      msg: 'Oops, Something went wrong.'
    });
    return;
  }
});

router.post('/getCollections', async function (req, res) {
  try {
    // let resVal = await metakeepRead(
    //   'fetchAllCollections',
    //   [],
    //   MarketplaceLambda
    // );
    // let colList = [];
    // resVal.data.map(e => {
    //   if (e.name != "" && e.symbol != "") {
    //     colList.push(e);
    //   }
    // })
    const colData = await axios.post(process.env.ADMIN_URL + '/getCollections', {}, { 'Content-Type': `application/json` });
    return res.send({
      status: true,
      data: colData.data.data
    });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

router.post('/newCollection', async function (req, res) {
  try {
    let result = await metakeepCreate(
      [req.body.name, req.body.symbol, MarketplaceLambda],
      'NFT',
      nftContract.bytecode,
      nftContract.abi
    );
    if (result.status == false) {
      return res.send({
        status: false,
        msg: result.msg
      });
    }
    NFTLambda = result.data.lambda;

    // console.log(result)

    let resultSetProperty = await metakeepInvoke(
      'setProperties',
      [req.body.fieldList, req.body.fieldTypeList],
      NFTLambda,
      'SetProperties'
    );

    let emsg = resultSetProperty.msg;
    if (resultSetProperty.status == true) {
      let resultCollection = await metakeepInvoke(
        'createCollection',
        [
          NFTLambda,
          req.body.name,
          req.body.symbol,
          JSON.stringify({
            fieldList: req.body.fieldList,
            fieldTypeList: req.body.fieldTypeList
          })
        ],
        MarketplaceLambda,
        'CreateCollection'
      );
      let collectionList = await metakeepRead(
        'fetchAllCollections',
        [],
        MarketplaceLambda
      );
      if (resultCollection.status) {
        return res.send({
          status: true,
          collections: collectionList.data
        });
      }
      emsg = resultCollection.msg;
    }
    return res.send({
      status: false,
      msg: 'Set Property failed'
    });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

router.post('/fetchAllItems', async function (req, res) {
  try {
    let resVal = await metakeepRead(
      'fetchAllItems',
      [req.body.nftAddr, req.body.page + '', '10'],
      MarketGetDataLambda
    );
    res.send({ data: resVal.data[0], count: resVal.data[1] });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

router.post('/fetchAllItemsOnUseOfOwner', async function (req, res) {
  try {
    let resVal = await metakeepRead(
      'fetchAllItemsOnUseOfOwner',
      [req.body.owner, req.body.nftAddr, req.body.page + '', '10'],
      MarketGetDataLambda
    );
    res.send({ data: resVal.data[0], count: resVal.data[1] });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

router.post('/fetchAllItemsOnSaleOfNotOwner', async function (req, res) {
  try {
    let resVal = await metakeepRead(
      'fetchAllItemsOnSaleOfNotOwner',
      [req.body.owner, req.body.nftAddr, req.body.page + '', '10'],
      MarketGetDataLambda
    );
    res.send({ data: resVal.data[0], count: resVal.data[1] });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

router.post('/fetchAllItemsOnSaleOfOwner', async function (req, res) {
  try {
    let resVal = await metakeepRead(
      'fetchAllItemsOnSaleOfOwner',
      [req.body.owner, req.body.nftAddr, req.body.page + '', '10'],
      MarketGetDataLambda
    );
    res.send({ data: resVal.data[0], count: resVal.data[1] });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

router.post('/fetchAllItemsOnSale', async function (req, res) {
  try {
    let nftList = await MarketContract.methods.fetchMarketItems(req.body.nftaddress).call();
    let nftcontract;
    if (req.body.nfttype == 'ERC721') {
      nftcontract = new web3.eth.Contract(VersusX721Info.abi, req.body.nftaddress);
    } else {
      nftcontract = new web3.eth.Contract(VersusX1155Info.abi, req.body.nftaddress);
    }
    const items = await Promise.all(nftList.map(async nftItem => {
      let nftInfo;
      if (req.body.nfttype == 'ERC721') {
        nftInfo = await nftcontract.methods.tokenURI(nftItem.tokenId).call();
      } else {
        nftInfo = await nftcontract.methods.uri(nftItem.tokenId).call();
      }
      let nftMetadata = await axiosGet(nftInfo);
      return {
        id: nftItem["tokenId"],
        itemId: nftItem["itemId"],
        address: nftItem["nftContract"],
        thumbnail: nftMetadata.data["image_url"],
        title: nftMetadata.data["name"],
        description: nftMetadata.data["description"],
        metadata: nftMetadata.data,
        isOwned: nftItem["seller"] == req.body.userAddress,
        price: nftItem["price"]
      };
    }))
    return res.json({
      status: true,
      msg: 'success',
      data: items
    });
  } catch(e) {
    console.log(e);
    return res.json({
      status: false,
      msg: 'Oops, something went wrong.',
      data: []
    });
  }
});

router.post('/getNFTData', async function (req, res) {
  //"https://eskillzpool.mypinata.cloud/ipfs/QmX46zmF6MDUeHPA5g2zQhEZ4vcDM4xJdKELFofnWEPMib"

  let result = [];
  let data = req.body.data;
  await Promise.all(
    data.map(async (e) => {
      if (e[0] != '0') {
        let tokenURL = await prevCueContract.methods.tokenURI(e[1]).call();
        result.push({
          tokenId: e[1],
          contract: e[2],
          owner: e[3],
          tokenURL: tokenURL
        });
      }
    })
  );
  console.log(result.length);
  return res.json(result);
});

router.post('/getNFTCardData', async function (req, res) {
  //"https://eskillzpool.mypinata.cloud/ipfs/QmX46zmF6MDUeHPA5g2zQhEZ4vcDM4xJdKELFofnWEPMib"

  let data = await marketCardContract.methods.fetchAllItems().call();

  // let result = [];
  // await Promise.all(data.map(async e=>{
  //   if(e[0] != "0"){
  //     let tokenURL = await prevCardContract.methods.tokenURI(e[1]).call();
  //     result.push({
  //       tokenId: e[1],
  //       contract: e[2],
  //       owner: e[3],
  //       tokenURL: tokenURL
  //     });
  //   }
  // }));
  // console.log(result.length);
  return res.json(data);
});

async function setMarketData() {
  let data = require('../../cuemarket.json');
  console.log(data.length);

  for (let i = 0; i < data.length; i++) {
    let e = data[i];
    console.log(`======== ${e[0]} ========`);
    await metakeepInvoke(
      'setMarketItem',
      e,
      MarketplaceLambda,
      'setMarketItem'
    );
    console.log(`======== ${e[0]} ========`);
  }
  // await metakeepInvoke('setTokenID', ["567"], MarketplaceLambda, "setTokenID");

  // let result = await metakeepRead('fetchAllItems', [], MarketplaceLambda);
  // console.log(result);

  console.log(`======== FINISH ========`);
}

async function setNFTData() {
  let data = require('../../cardnft.json');
  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    let e = data[i];
    console.log(`======== ${e.tokenId} ========`);
    await metakeepInvoke(
      'setToken',
      [e.tokenId, e.tokenURL, e.owner],
      e.contract,
      'setToken'
    );
    console.log(`======== ${e.tokenId} ========`);
  }
  await metakeepInvoke('setTokenID', ['421'], data[0].contract, 'setTokenID');
  // await metakeepRead('totalNFTs', [], data[0].contract);
  // await metakeepRead('ownerOf', ["119"], data[0].contract);
  // await metakeepRead('tokenURI', ["119"], data[0].contract);

  console.log(`======== FINISH ========`);
}

router.post('/deleteMarketItem', async function (req, res) {
  try {
    let Id = req.body.Id;
    let result = await metakeepInvoke(
      'deleteMarketItem',
      [Id + ''],
      MarketplaceLambda,
      'DeleteMarketItem'
    );
    res.send(result);
  } catch {
    res.send('failed');
    return;
  }
});

router.post('/getTokenPrice', async function (req, res) {
  try {
    var contract = req.body.address.toString().toLowerCase();
    var amount = req.body.amount;

    if (contract == SkillLambda.toLowerCase()) {
      let reserveData = await metakeepRead(
        'getReserves',
        [SkillLambda, MaticAddress],
        GetPriceLambda
      );
      let result = Math.floor(
        (Number(amount) / Number(reserveData.data[0])) *
        Number(reserveData.data[1])
      );
      let maticVal = result / 10 ** 18;

      let usdPriceRes = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
      );
      let usdPrice = usdPriceRes.data['matic-network']['usd'];

      res.send(String(maticVal * usdPrice));
    } else if (contract == MaticAddress.toLowerCase()) {
      let usdPriceRes = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
      );
      let usdPrice = usdPriceRes.data['matic-network']['usd'];

      let realAmount = Number(amount) / 10 ** 18;

      res.send(String(realAmount * Number(usdPrice)));
    } else {
      let usdPriceRes = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${contract}&vs_currencies=usd`
      );
      let usdPrice = usdPriceRes.data[contract]['usd'];
      let realAmount = Number(amount) / 10 ** 18;

      res.send(String(realAmount * Number(usdPrice)));
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

router.post('/deleteCollection', async function (req, res) {
  try {
    if (req.body.collectionId == "") {
      return res.send({
        status: false,
        msg: "Invalid request parameter"
      });
    }
    let resultCollection = await metakeepInvoke(
      'deleteCollection',
      [
        req.body.collectionId
      ],
      MarketplaceLambda,
      'DeleteCollection'
    );
    if (resultCollection.status) {
      return res.send({
        status: true
      });
    }

    return res.send({
      status: false,
      msg: resultCollection.msg
    });
  } catch {
    return res.send({
      status: false,
      msg: 'Oops, something went wrong.'
    });
  }
});

/**
 * upload file to ipfs
 */
router.post('/uploadToIPFS', async function(req, res) {
    if(!req.files.file) {
      return res.send({
        status: false,
        msg: 'Please select file.'
      });
    }

    let response = await pinFileToIPFS(fs.createReadStream(req.files.file.tempFilePath));
    return res.send(response);
  }
);

/**
 * upload metadata to ipfs
 */
router.post('/uploadMetadataToIPFS', async function(req, res) {
  try {
    let metadata = req.body.metadata;
    let name = req.body.name;
    let description = req.body.description;
    let nft_type = req.body.nft_type;
    let image_url = req.body.image_url;
    let is_default = req.body.is_default;

    if(!metadata) {
      return res.send({
        status: false,
        msg: 'Please input metadata.'
      });
    }

    let data = {
      name: name,
      description: description,
      image_url: image_url,
      nft_type: nft_type,
      is_default: is_default,
      metadata: JSON.parse(metadata),
    };

    const pinataResponse = await pinJSONToIPFS(data);
    if (!pinataResponse.success) {
      res.send({
        status: false,
        msg: 'something went wrong.'
      });
    } else {
      res.send({
        status: true,
        url: pinataResponse.pinataUrl
      });
    }
  } catch(e) {
    console.log(e);
    res.send({
      status: false,
      msg: 'something went wrong.'
    });
  }
  
});


const _createAvatarNFT = async function(nftType, collectionAddress, userAddress, quantity, uri) {
  try {

      console.log(`_createAvatarNFT ${collectionAddress} ${userAddress} ${quantity} ${uri}`);
      let nftContract;
      if (nftType == 'ERC721') {
        nftContract = new web3.eth.Contract(VersusX721Info.abi, collectionAddress);
      } else {
        nftContract = new web3.eth.Contract(VersusX1155Info.abi, collectionAddress);
      }

      let count = await web3.eth.getTransactionCount(process.env.MATIC_WALLET_ADDRESS, "latest"); //get latest nonce
      let nonce = count;
      let gasPrice = await web3.eth.getGasPrice();
      let chainId = PolygonChainId;

      console.log(gasPrice);

      let tx;
      
      if (nftType == "ERC721") {
        tx = userAddress == "" ?
        nftContract.methods.createToken(uri) :
        nftContract.methods.createTokenToUser(userAddress, uri);
      } else {
        tx = userAddress == "" ?
        nftContract.methods.createToken(uri, quantity) :
        nftContract.methods.createTokenToUser(userAddress, uri, quantity);
      }

      let gas = await tx.estimateGas({ from: process.env.MATIC_WALLET_ADDRESS });
      let data = tx.encodeABI();
      let signedTx = await web3.eth.accounts.signTransaction(
        {
          to: collectionAddress,
          data,
          gas: gas * 2,
          gasPrice,
          maxPriorityFeePerGas: gasPrice * 2,
          nonce,
          chainId
        },
        process.env.MATIC_WALLET_PRIVATEKEY
      );
      let transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log(transactionReceipt);

      // Wait until nft is successfully until listed.
      let retryCnt = 0;
      while (retryCnt < 10) {
        let nftList = await Moralis.default.EvmApi.nft.getWalletNFTs({
          "chain": process.env.MORALIS_POLYGON_CHAIN_ID,
          "format": "decimal",
          "tokenAddresses": [
            collectionAddress
          ],
          "mediaItems": true,
          "address": userAddress
        });
        if (nftList.result.length > 0)
          return true;
        retryCnt ++;
        await new Promise((resolve) => setTimeout(() => resolve(), 2000));
      }
      return false;
  } catch(e) {
    console.log(e);
    return false;
  }
}


/**
 * mint avatar NFT
 */
router.post('/mintAvatarNFT', async function(req, res) {
  let metadata = req.body.metadata;
  let name = req.body.name;
  let description = req.body.description;
  let userAddress = req.body.userAddress;
  let is_default = req.body.is_default;

  const colData = await axios.post(process.env.ADMIN_URL + '/getCollectionInfo', {
    name: 'AVATAR'
  }, { 'Content-Type': `application/json` });

  console.log(colData.data);
  if(colData.data.status == false) {
    return res.send({
      status: false,
      msg: 'The collection does not exist.'
    });
  }
  
  let collectionInfo = colData.data.data;

  let collectionAddress = collectionInfo.collection_address;
  let nft_type = collectionInfo.collection_type;
  try {
   // upload metadata
    if(!metadata) {
      return res.send({
        status: false,
        msg: 'Please input metadata.'
      });
    }

    let metaObj = JSON.parse(metadata);

    let data = {
      name: name,
      description: description,
      is_default: is_default,
      ...metaObj,
    };

    const pinataResponse = await pinJSONToIPFS(data);
    if (pinataResponse.success) {
      let result = await _createAvatarNFT(nft_type, collectionAddress, userAddress, 1, pinataResponse.pinataUrl);
      if(result) {
        res.send({
          status: true
        });
      } else {
        res.send({
          status: false,
          msg: 'something went wrong1.'
        });
      }
    } else {
      res.send({
        status: false,
        msg: 'something went wrong2.'
      });
    } 
  } catch (error) {
    console.log(error)
    res.send({
      status: false,
      msg: 'something went wrong3.'
    });
  }
});



/**
 * mint avatar NFT
 */
router.post('/mintClothNFT', async function(req, res) {
  let metadata = req.body.metadata;
  let name = req.body.name;
  let description = req.body.description;
  let userAddress = req.body.userAddress;
  let is_default = req.body.is_default;
  let collection = req.body.collection;


  const colData = await axios.post(process.env.ADMIN_URL + '/getCollectionInfo', {
    name: collection
  }, { 'Content-Type': `application/json` });
  console.log(colData.data);

  if(colData.data.status == false) {
    return res.send({
      status: false,
      msg: 'The collection does not exist.'
    });
  }
  
  let collectionInfo = colData.data.data;
  let collectionAddress = collectionInfo.collection_address;
  let nft_type = collectionInfo.collection_type;

  try {
   // upload metadata
    if(!metadata) {
      return res.send({
        status: false,
        msg: 'Please input metadata.'
      });
    }

    let metaObj = JSON.parse(metadata);

    let data = {
      name: name,
      description: description,
      is_default: is_default,
      ...metaObj,
    };

    const pinataResponse = await pinJSONToIPFS(data);
    console.log(pinataResponse);
    if (pinataResponse.success) {
      let result = await _createAvatarNFT(nft_type, collectionAddress, userAddress, 1, pinataResponse.pinataUrl);
      if(result) {
        res.send({
          status: true,
          name: name
        });
      } else {
        res.send({
          status: false,
          msg: 'something went wrong.1'
        });
      }
    } else {
      res.send({
        status: false,
        msg: 'something went wrong.2'
      });
    } 
  } catch {
    res.send({
      status: false,
      msg: 'something went wrong.3'
    });
  }
});


/**
 * update NFT metadata
 */
router.post('/updateNFTMetadata', async function(req, res) {
  try {
    let metadata = req.body.metadata;
    let nftType = req.body.nft_type;
    let is_default = req.body.is_default;
    let userAddress = req.body.userAddress;
    let collectionAddress = req.body.collectionAddress;
    let tokenId = req.body.token_id;

    if(!metadata) {
      return res.send({
        status: false,
        msg: 'Please input metadata.'
      });
    }
    
    let metaObj = JSON.parse(metadata);

    let data = {
      is_default: is_default,
      ...metaObj,
    };
    
    const pinataResponse = await pinJSONToIPFS(data);
    if (!pinataResponse.success) {
      res.send({
        status: false,
        msg: 'Pinata failed.'
      });
    } else {
      const url = pinataResponse.pinataUrl;
      let nftContract = new web3.eth.Contract(VersusX721Info.abi, collectionAddress);
      let count = await web3.eth.getTransactionCount(process.env.MATIC_WALLET_ADDRESS, "latest"); //get latest nonce
      let nonce = count;
      let gasPrice = await web3.eth.getGasPrice();
      let chainId = PolygonChainId;

      let tx;
      console.log(url, nftType, collectionAddress, userAddress);
      tx = nftContract.methods.updateTokenUri(userAddress, tokenId, url);

      console.log(tx);

      let gas = await tx.estimateGas({ from: process.env.MATIC_WALLET_ADDRESS });
      let data = tx.encodeABI();
      let signedTx = await web3.eth.accounts.signTransaction(
        {
          to: collectionAddress,
          data,
          gas: gas * 2,
          gasPrice,
          nonce,
          chainId
        },
        process.env.MATIC_WALLET_PRIVATEKEY
      );
      let transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      res.send({
        status: true,
        url,
        transactionReceipt
      });
    }
  } catch(e) {
    console.log(e);
    res.send({
      status: false,
      msg: e.toString()
    });
  }
  
});

router.post('/redeemAvatarList', async function (req, res) {
  const userAddress = req.body.address;
  const holoPassNFT = new web3.eth.Contract(holoPassNFTContract, HoloPassNFTAddress);
  const tokens = await holoPassNFT.methods.tokensOfOwner(userAddress).call();
  res.json(tokens);
});

router.post('/redeemAvatar', async function (req, res) {
  const userAddress = req.body.address;
  const redeemId = req.body.redeemId;
  const avatarTokenId = req.body.tokenId;

  // check user have redeem
  const holoPassNFT = new web3.eth.Contract(holoPassNFTContract, HoloPassNFTAddress);
  const tokens = await holoPassNFT.methods.tokensOfOwner(userAddress).call();
  if (tokens.findIndex(tk => tk === redeemId) == -1) {
    res.json({
      status: "false",
      msg: "User does not have selected redeem nft"
    });
    return;
  }


  const colData = await axios.post(process.env.ADMIN_URL + '/getCollectionInfo', {
    name: 'AVATAR'
  }, { 'Content-Type': `application/json` });

  console.log(colData.data);
  if(colData.data.status == false) {
    return res.send({
      status: false,
      msg: 'The avatar collection does not exist.'
    });
  }
  
  let collectionInfo = colData.data.data;

  let collectionAddress = collectionInfo.collection_address;
  let nft_type = collectionInfo.collection_type;
  
  let contract, metadata = {}, nftInfo, ownerAddress;
  if (nft_type === 'ERC721') {
    contract = new web3.eth.Contract(VersusX721Info.abi, collectionAddress);
    nftInfo = await contract.methods.tokenURI(avatarTokenId).call();
    ownerAddress = await contract.methods.ownerOf(avatarTokenId).call();
    metadata = await axiosGet(nftInfo);
  } else {
    contract = new web3.eth.Contract(VersusX1155Info.abi, collectionAddress);
    nftInfo = await contract.methods.uri(avatarTokenId).call();
    ownerAddress = await contract.methods.ownerOf(avatarTokenId).call();
    metadata = await axiosGet(nftInfo);
  }
  metadata = metadata.data;

  let clothes = ["upper_clothing", "lower_clothing", "footwear", "accessory"];
  let collection_names = ["APP_UPPER", "APP_LOWER", "APP_FOOTWEAR", "APP_ACCESSORY"];
  for (let i = 0; i < clothes.length; i ++) {
    const cloth = clothes[i];
    const collection_name = collection_names[i];
    const uid = metadata[cloth];
    if (!uid) {
      continue;
    }
    try {
      const nft = await findClothBasedOnUIDAndMint(collection_name, ownerAddress, uid);
      if (!nft) continue;
        await _createAvatarNFT(nft.nft_type, nft.collectionAddress, userAddress, 1, nft.tokenURI);
    }
    catch (e) {
      console.log(e);
    }
  }

  try {
    const result = await _createAvatarNFT(nft_type, collectionAddress, userAddress, 1, nftInfo);
    if (!result) {
      res.json({
        status: false,
        msg: "Error at avatar minting"
      });
      return;
    }
    try {
      let tx = await holoPassNFT.methods.burnNFT(redeemId);
      let gas = await tx.estimateGas({ from: process.env.MATIC_WALLET_ADDRESS });
      let data = tx.encodeABI();
      let count = await web3.eth.getTransactionCount(process.env.MATIC_WALLET_ADDRESS, "latest"); //get latest nonce
      let gasPrice = await web3.eth.getGasPrice();
      let chainId = PolygonChainId;
      let signedTx = await web3.eth.accounts.signTransaction(
        {
          to: collectionAddress,
          data,
          gas: gas * 2,
          gasPrice,
          nonce: count,
          chainId
        },
        process.env.MATIC_WALLET_PRIVATEKEY
      );
      let transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      res.json({
        status: true,
        msg: "Successfully airdroped avatar"
      });
    }
    catch (e) {
      console.log(e);
      res.json({
        status: false,
        msg: "Error at burning redeem nft"
      });
      return;
    }

  }
  catch (e) {
    console.log(e);
    res.json({
      status: false,
      msg: "Error at minting avatar and burning"
    });
    return;
  }
});

async function findClothBasedOnUIDAndMint(type, address, uid) {
  const colData = await axios.post(process.env.ADMIN_URL + '/getCollectionInfo', {
    name: type
  }, { 'Content-Type': `application/json` });

  if(colData.data.status == false) {
    return null;
  }
  
  let collectionInfo = colData.data.data;
  let collectionAddress = collectionInfo.collection_address;
  let nft_type = collectionInfo.collection_type;

  let nftList = await Moralis.default.EvmApi.nft.getWalletNFTs({
        "chain": process.env.MORALIS_POLYGON_CHAIN_ID,
        "format": "decimal",
        "tokenAddresses": [
          collectionAddress
        ],
        "mediaItems": true,
        "address": address
      });

  let contract;
  if (nft_type === 'ERC721') {
    contract = new web3.eth.Contract(VersusX721Info.abi, collectionAddress);
  } else {
    contract = new web3.eth.Contract(VersusX1155Info.abi, collectionAddress);
  }

  const items = await Promise.all(nftList.result.map(async nftItem => {
    let metadata = {}, nftInfo;
    if (nft_type === 'ERC721') {
      nftInfo = await contract.methods.tokenURI(nftItem.tokenId).call();
      metadata = await axiosGet(nftInfo);
    } else {
      nftInfo = await contract.methods.uri(nftItem.tokenId).call();
      metadata = await axiosGet(nftInfo);
    }
    metadata = metadata.data;
    return {
      id: nftItem["tokenId"],
      balance: nftItem["amount"],
      address: nftItem["token_address"],
      thumbnail: metadata?metadata["image_url"]:"",
      title: nftItem["name"],
      description: metadata?metadata["description"]:"",
      metadata: metadata,
      tokenURI: nftInfo,
      isOwned: true
    };
  }))
  
  if (items.length == 0) {
    return null;
  }
  const item = items.find(item => item.metadata.uid == uid);
  if (!item) return null;
  console.log(item);
  if (!item.tokenURI) return null;
  return { nft_type, collectionAddress, tokenURI: item.tokenURI};
}
// setMarketData();
// setNFTData();

module.exports = router;
