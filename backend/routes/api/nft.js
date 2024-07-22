const express = require('express');
const axios = require('axios');
const router = express.Router();
const Web3 = require('web3');
const { ethers, Contract } = require('ethers');
require('dotenv').config();
const CONFIG = require('./../../config');
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
};

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
var latestNonce = 0;

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

const MarketContractInfo = require('./../../abi/VersusXMarket.json');
let MarketContract = new web3.eth.Contract(
  MarketContractInfo.abi,
  process.env.VERSUSX_MARKET_ADDRESS
);

const VersusX721Info = require('./../../abi/VersusX721.json');
const VersusX1155Info = require('./../../abi/VersusX1155.json');

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
        msg: 'ID is null',
        data: null
      });
    } else {
      let nftData;
      try {
        nftData = await axios
          .get(
            `https://polygon-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_KEY}/getNFTMetadata?contractAddress=${req.body.contract}&tokenId=${req.body.id}&refreshCache=false&refreshCache=true`
          )
          .then((res) => res.data)
          .catch((e) => null);
        if (nftData.data.error) {
          return res.json({
            status: false,
            msg: 'NFT Metadata get error',
            error: nftData.data.error
          });
        }
        return res.json({
          status: true,
          msg: 'success',
          data: nftData.data.metadata
        });
      } catch (e) {
        return res.json({
          status: false,
          msg: 'NFT Metadata not found'
        });
      }
    }
    return;
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      msg: 'something went wrong',
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

    const colData = await axios.post(
      process.env.ADMIN_URL + '/getCollectionInfo',
      {
        name: NFTType
      },
      { 'Content-Type': `application/json` }
    );

    console.log(colData.data);
    if (colData.data.status == false) {
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
        msg: 'Wrong Parameter'
      });
    } else {
      try {
        const items = [];
        let pageKey = '';
        do {
          let nftListData = await axios.get(
            `https://polygon-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_KEY}/getNFTsForOwner?owner=${address}&contractAddresses[]=${collectionAddress}&withMetadata=true&pageSize=100&refreshCache=true&pageKey=` +
              pageKey
          );
          for (const nftItem of nftListData.data.ownedNfts) {
            const metadata = nftItem.raw.metadata;
            const balance = parseInt(nftItem['balance']);
            for (let i = 0; i < balance; i++) {
              items.push({
                id: nftItem['tokenId'],
                balance: 1,
                address: collectionAddress,
                thumbnail: metadata ? metadata['image_url'] : '',
                title: NFTType,
                description: metadata ? metadata['description'] : '',
                metadata: metadata,
                isOwned: true
              });
            }
          }
          console.log(nftListData);
          pageKey = nftListData.data.pageKey;
        } while (pageKey);

        return res.json({
          status: true,
          msg: 'success',
          count: items.length,
          page: 1,
          data: items
        });
      } catch (e) {
        res.json({
          status: 'false',
          msg: 'Error at fetching nft list data from alchemy: ' + e
        });
        return;
      }

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
    return res.json({
      status: false,
      msg: 'Something went wrong.'
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

const pinFileToIPFS = async function (file) {
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
      maxContentLength: Infinity,
      maxBodyLength: Infinity
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
};

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
    const colData = await axios.post(
      process.env.ADMIN_URL + '/getCollections',
      {},
      { 'Content-Type': `application/json` }
    );
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
    let nftList = await MarketContract.methods
      .fetchMarketItems(req.body.nftaddress)
      .call();
    let nftcontract;
    if (req.body.nfttype == 'ERC721') {
      nftcontract = new web3.eth.Contract(
        VersusX721Info.abi,
        req.body.nftaddress
      );
    } else {
      nftcontract = new web3.eth.Contract(
        VersusX1155Info.abi,
        req.body.nftaddress
      );
    }
    const items = await Promise.all(
      nftList.map(async (nftItem) => {
        let nftInfo;
        if (req.body.nfttype == 'ERC721') {
          nftInfo = await nftcontract.methods.tokenURI(nftItem.tokenId).call();
        } else {
          nftInfo = await nftcontract.methods.uri(nftItem.tokenId).call();
        }
        let nftMetadata = await axiosGet(nftInfo);
        return {
          id: nftItem['tokenId'],
          itemId: nftItem['itemId'],
          address: nftItem['nftContract'],
          thumbnail: nftMetadata.data['image_url'],
          title: nftMetadata.data['name'],
          description: nftMetadata.data['description'],
          metadata: nftMetadata.data,
          isOwned: nftItem['seller'] == req.body.userAddress,
          price: nftItem['price']
        };
      })
    );
    return res.json({
      status: true,
      msg: 'success',
      data: items
    });
  } catch (e) {
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
      console.log(usdPrice);
      let realAmount = (Number(amount) * Number(usdPrice)) / 10 ** 18;

      res.send(realAmount.toFixed(20));
    }
    return;
  } catch (error) {
    res.send('{}');
    return;
  }
});

router.post('/deleteCollection', async function (req, res) {
  try {
    if (req.body.collectionId == '') {
      return res.send({
        status: false,
        msg: 'Invalid request parameter'
      });
    }
    let resultCollection = await metakeepInvoke(
      'deleteCollection',
      [req.body.collectionId],
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
router.post('/uploadToIPFS', async function (req, res) {
  if (!req.files.file) {
    return res.send({
      status: false,
      msg: 'Please select file.'
    });
  }

  let response,
    try_cnt = 0;

  while (try_cnt < 5) {
    response = await pinFileToIPFS(
      fs.createReadStream(req.files.file.tempFilePath)
    );
    if (response.success) {
      break;
    }
    try_cnt++;
  }
  return res.send(response);
});

/**
 * upload metadata to ipfs
 */
router.post('/uploadMetadataToIPFS', async function (req, res) {
  try {
    let metadata = req.body.metadata;
    let name = req.body.name;
    let description = req.body.description;
    let nft_type = req.body.nft_type;
    let image_url = req.body.image_url;
    let is_default = req.body.is_default;

    if (!metadata) {
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
      metadata: JSON.parse(metadata)
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
  } catch (e) {
    console.log(e);
    res.send({
      status: false,
      msg: 'something went wrong.'
    });
  }
});

const _createAvatarNFT = async function (
  nftType,
  collectionAddress,
  userAddress,
  quantity,
  uri
) {
  let transactionSuccess = false;
  try {
    console.log(
      `_createAvatarNFT ${collectionAddress} ${userAddress} ${quantity} ${uri}`
    );
    let nftContract;
    if (nftType == 'ERC721') {
      nftContract = new web3.eth.Contract(
        VersusX721Info.abi,
        collectionAddress
      );
    } else {
      nftContract = new web3.eth.Contract(
        VersusX1155Info.abi,
        collectionAddress
      );
    }

    let tx;

    if (nftType == 'ERC721') {
      tx =
        userAddress == ''
          ? nftContract.methods.createToken(uri)
          : nftContract.methods.createTokenToUser(userAddress, uri);
    } else {
      tx =
        userAddress == ''
          ? nftContract.methods.createToken(uri, quantity)
          : nftContract.methods.createTokenToUser(userAddress, uri, quantity);
    }

    let previousCount = 0;
    try {
      nftListData = await axios.get(
        `https://polygon-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_KEY}/getNFTsForOwner?owner=${userAddress}&contractAddresses[]=${collectionAddress}&withMetadata=true&pageSize=100&refreshCache=true`
      );
      previousCount = parseInt(nftListData.data.totalCount);
      if (!previousCount) previousCount = 0;
      console.log(previousCount);
    } catch (e) {
      console.log(e);
    }

    const transactionReceipt = await runTransaction(collectionAddress, tx);
    if (transactionReceipt === false) {
      return {
        result: false,
        error: 'Mint failed, try again later.'
      };
    }

    transactionSuccess = true;

    // Wait until nft is successfully until listed.
    let retryCnt = 0;
    while (retryCnt < 10) {
      try {
        let nftListData = await axios.get(
          `https://polygon-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_KEY}/getNFTsForOwner?owner=${userAddress}&contractAddresses[]=${collectionAddress}&withMetadata=true&pageSize=100&refreshCache=true`
        );
        if (parseInt(nftListData.data.totalCount) > previousCount)
          return {
            result: true
          };
      } catch (e) {
        console.log(e);
      }
      retryCnt++;
      await new Promise((resolve) => setTimeout(() => resolve(), 2000));
    }
    return {
      result: true,
      error: 'not found after retry'
    };
  } catch (e) {
    console.log(e);
    if (!transactionSuccess) {
      latestNonce = await web3.eth.getTransactionCount(
        process.env.MATIC_WALLET_ADDRESS,
        'latest'
      );
    }
    return {
      result: false,
      error: e + ''
    };
  }
};

/**
 * mint avatar NFT
 */
router.post('/mintAvatarNFT', async function (req, res) {
  let metadata = req.body.metadata;
  let name = req.body.name;
  let description = req.body.description;
  let userAddress = req.body.userAddress;
  let is_default = req.body.is_default;

  const colData = await axios.post(
    process.env.ADMIN_URL + '/getCollectionInfo',
    {
      name: 'VSX_AVATARS'
    },
    { 'Content-Type': `application/json` }
  );

  console.log(colData.data);
  if (colData.data.status == false) {
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
    if (!metadata) {
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
      ...metaObj
    };

    const pinataResponse = await pinJSONToIPFS(data);
    if (pinataResponse.success) {
      let result = await _createAvatarNFT(
        nft_type,
        collectionAddress,
        userAddress,
        1,
        pinataResponse.pinataUrl
      );
      if (result.result) {
        res.send({
          status: true
        });
      } else {
        res.send({
          status: false,
          msg: 'something went wrong: ' + result.result
        });
      }
    } else {
      res.send({
        status: false,
        msg: 'something went wrong2.'
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      msg: 'something went wrong3.'
    });
  }
});

/**
 * mint holo avatar NFT
 */
router.post('/mintHoloNFT', async function (req, res) {
  let metadata = req.body.metadata;
  let name = req.body.name;
  let description = req.body.description;
  let userAddress = req.body.userAddress;
  let is_default = req.body.is_default;

  const colData = await axios.post(
    process.env.ADMIN_URL + '/getCollectionInfo',
    {
      name: 'VSX_HIGH_ROLLERS'
    },
    { 'Content-Type': `application/json` }
  );

  console.log(colData.data);
  if (colData.data.status == false) {
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
    if (!metadata) {
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
      ...metaObj
    };

    const pinataResponse = await pinJSONToIPFS(data);
    if (pinataResponse.success) {
      let result = await _createAvatarNFT(
        nft_type,
        collectionAddress,
        userAddress,
        1,
        pinataResponse.pinataUrl
      );
      if (result.result) {
        res.send({
          status: true
        });
      } else {
        res.send({
          status: false,
          msg: 'something went wrong: ' + result.error
        });
      }
    } else {
      res.send({
        status: false,
        msg: 'something went wrong2.'
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      msg: 'something went wrong3.'
    });
  }
});

/**
 * mint avatar NFT
 */
router.post('/mintClothNFT', async function (req, res) {
  let metadata = req.body.metadata;
  let name = req.body.name;
  let description = req.body.description;
  let userAddress = req.body.userAddress;
  let is_default = req.body.is_default;

  const colData = await axios.post(
    process.env.ADMIN_URL + '/getCollectionInfo',
    {
      name: 'VSX_CLOTHING'
    },
    { 'Content-Type': `application/json` }
  );
  console.log(colData.data);

  if (colData.data.status == false) {
    return res.send({
      status: false,
      msg: 'The collection does not exist.'
    });
  }

  let collectionInfo = colData.data.data;
  let collectionAddress = collectionInfo.collection_address;
  let clothingContract = new web3.eth.Contract(
    VersusX1155Info.abi,
    collectionAddress
  );
  let nft_type = collectionInfo.collection_type;

  try {
    // upload metadata
    if (!metadata) {
      return res.send({
        status: false,
        msg: 'Please input metadata.'
      });
    }

    let metaObj = JSON.parse(metadata);

    let rows = await knex('clothing')
      .where('name', metaObj.name)
      .where('contract', collectionAddress)
      .select('*');
    let pinataResponse;
    if (rows.length) {
      let prevMetaObj = JSON.parse(rows[0].metadata);
      if (
        Object.keys(prevMetaObj).length != Object.keys(metadata).keys(metadata)
      ) {
        let data = {
          name: name,
          description: description,
          is_default: is_default,
          ...metaObj
        };

        pinataResponse = await pinJSONToIPFS(data);
        const new_url = pinataResponse.pinataUrl;

        const tokenId = await getClothTokenIdFromUri(
          collectionAddress,
          rows[0].token_uri ? rows[0].token_uri : rows[0].tokenUri
        );

        let update_token_uri_tx = await clothingContract.methods.updateTokenUri(
          tokenId,
          new_url
        );
        await runTransaction(collectionAddress, update_token_uri_tx);
        await knex('clothing').where('id', rows[0].id).update({
          token_uri: new_url,
          metadata
        });
      } else {
        pinataResponse = {
          success: true,
          pinataUrl: rows[0].token_uri ? rows[0].token_uri : rows[0].tokenUri
        };
      }
      const uidRows = await knex('clothing')
        .where('uid', metaObj.uid)
        .select('*');
      if (!uidRows.length) {
        await knex('clothing').insert([
          {
            id: 0,
            type: metaObj.clothing_type,
            uid: metaObj.uid,
            name: metaObj.name,
            metadata,
            token_uri: pinataResponse.pinataUrl,
            contract: collectionAddress,
            count: 1,
            created_at: Date.now(),
            owner: userAddress
          }
        ]);
      }
    } else {
      let data = {
        name: name,
        description: description,
        is_default: is_default,
        ...metaObj
      };

      pinataResponse = await pinJSONToIPFS(data);
      await knex('clothing').insert([
        {
          id: 0,
          type: metaObj.clothing_type,
          uid: metaObj.uid,
          name: metaObj.name,
          metadata,
          token_uri: pinataResponse.pinataUrl,
          contract: collectionAddress,
          count: 1,
          created_at: Date.now(),
          owner: userAddress
        }
      ]);
    }

    console.log(pinataResponse);
    if (pinataResponse.success) {
      let result = await _createAvatarNFT(
        nft_type,
        collectionAddress,
        userAddress,
        1,
        pinataResponse.pinataUrl
      );
      if (result.result) {
        res.send({
          status: true,
          name: name
        });
      } else {
        res.send({
          status: false,
          msg: 'something went wrong: ' + result.error
        });
      }
    } else {
      res.send({
        status: false,
        msg: 'something went wrong.2'
      });
    }
  } catch (e) {
    console.log(e);
    res.send({
      status: false,
      msg: 'something went wrong.' + e
    });
  }
});

/**
 * update NFT metadata
 */
router.post('/updateNFTMetadata', async function (req, res) {
  try {
    let metadata = req.body.metadata;
    let nftType = req.body.nft_type;
    let is_default = req.body.is_default;
    let userAddress = req.body.userAddress;
    let collectionAddress = req.body.collectionAddress;
    let tokenId = req.body.token_id;

    if (!metadata) {
      return res.send({
        status: false,
        msg: 'Please input metadata.'
      });
    }

    let metaObj = JSON.parse(metadata);

    let data = {
      is_default: is_default,
      ...metaObj
    };

    const pinataResponse = await pinJSONToIPFS(data);
    if (!pinataResponse.success) {
      res.send({
        status: false,
        msg: 'Pinata failed.'
      });
    } else {
      const url = pinataResponse.pinataUrl;
      let nftContract;
      if (nftType === 'ERC721') {
        nftContract = new web3.eth.Contract(
          VersusX721Info.abi,
          collectionAddress
        );
      } else {
        nftContract = new web3.eth.Contract(
          VersusX1155Info.abi,
          collectionAddress
        );
      }
      let tx;
      tx = nftContract.methods.updateTokenUri(userAddress, tokenId, url);

      let transactionReceipt = await runTransaction(collectionAddress, tx);
      res.send({
        status: true,
        url,
        transactionReceipt
      });
    }
  } catch (e) {
    console.log(e);
    res.send({
      status: false,
      msg: e.toString()
    });
  }
});

router.post('/redeemAvatarList', async function (req, res) {
  const userAddress = req.body.address;
  console.log(HoloPassNFTAddress);
  const holoPassNFT = new web3.eth.Contract(
    holoPassNFTContract,
    HoloPassNFTAddress
  );
  const tokens = await holoPassNFT.methods.tokensOfOwner(userAddress).call();
  res.json(tokens);
});

router.post('/redeemAvatar', async function (req, res) {
  const userAddress = req.body.address;
  const redeemId = req.body.redeemId;
  const avatarTokenId = req.body.tokenId;

  // check user have redeem
  const holoPassNFT = new web3.eth.Contract(
    holoPassNFTContract,
    HoloPassNFTAddress
  );
  const tokens = await holoPassNFT.methods.tokensOfOwner(userAddress).call();
  console.log(tokens);
  if (tokens.findIndex((tk) => tk === redeemId.toString()) == -1) {
    res.json({
      status: 'false',
      msg: 'User does not have selected redeem nft'
    });
    return;
  }

  const colData = await axios.post(
    process.env.ADMIN_URL + '/getCollectionInfo',
    {
      name: 'VSX_HIGH_ROLLERS'
    },
    { 'Content-Type': `application/json` }
  );

  console.log(colData.data);
  if (colData.data.status == false) {
    return res.send({
      status: false,
      msg: 'The avatar collection does not exist.'
    });
  }

  try {
    let tx = await holoPassNFT.methods.safeTransferFrom(
      userAddress,
      process.env.MATIC_WALLET_ADDRESS,
      redeemId
    );
    let transactionReceipt = await runTransaction(HoloPassNFTAddress, tx);
    if (!transactionReceipt) {
      res.json({
        status: false,
        msg: 'Error at burning redeem nft'
      });
      return;
    }
  } catch (e) {
    console.log(e);
    res.json({
      status: false,
      msg: 'Error at burning redeem nft'
    });
    return;
  }

  let collectionInfo = colData.data.data;

  let collectionAddress = collectionInfo.collection_address;
  let nft_type = collectionInfo.collection_type;

  let contract,
    metadata = {},
    nftInfo,
    ownerAddress;
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
  console.log('Address', collectionAddress);
  metadata = metadata.data;

  let clothes = ['upper_clothing', 'lower_clothing', 'footwear', 'accessory'];
  for (let i = 0; i < clothes.length; i++) {
    const cloth = clothes[i];
    const uid = metadata[cloth];
    if (!uid) {
      continue;
    }
    try {
      const nft = await findClothBasedOnUID(uid);
      if (!nft) continue;
      // await _createAvatarNFT(
      //   'ERC1155',
      //   nft.contract,
      //   userAddress,
      //   1,
      //   nft.tokenURI
      // );
      console.log(nft);
      const token_id = await getClothTokenIdFromUri(nft.contract, nft.tokenURI);
      console.log('TokenId', token_id);
      let clothingContract = new web3.eth.Contract(
        VersusX1155Info.abi,
        nft.contract
      );
      let clothing_transfer_tx =
        await clothingContract.methods.safeTransferFrom(
          process.env.MATIC_WALLET_ADDRESS,
          userAddress,
          token_id,
          1,
          []
        );
      await runTransaction(nft.contract, clothing_transfer_tx);
    } catch (e) {
      console.log(e);
    }
  }
  try {
    let avatar_transfer_tx = await contract.methods.safeTransferFrom(
      process.env.MATIC_WALLET_ADDRESS,
      userAddress,
      avatarTokenId
    );
    await runTransaction(collectionAddress, avatar_transfer_tx);
    res.json({
      status: true,
      msg: 'Successfully airdroped avatar'
    });
  } catch (e) {
    console.log(e);
    let tx = await holoPassNFT.methods.safeTransferFrom(
      process.env.MATIC_WALLET_ADDRESS,
      userAddress,
      redeemId
    );
    let transactionReceipt = await runTransaction(HoloPassNFTAddress, tx);
    res.json({
      status: false,
      msg: 'Error at minting avatar and burning'
    });
    return;
  }
});

async function findClothBasedOnUID(uid) {
  let rows = await knex('clothing').where('uid', uid).select('*');
  if (rows.length) {
    console.log(rows[0].token_uri);
    try {
      return {
        contract: rows[0].contract,
        tokenURI: rows[0].token_uri,
        metadata: JSON.parse(rows[0].metadata)
      };
    } catch (e) {
      return {
        contract: rows[0].contract,
        tokenURI: rows[0].token_uri,
        metadata: null
      };
    }
  }
  return null;
}

async function getClothTokenIdFromUri(contract, uri) {
  let clothContract = new web3.eth.Contract(VersusX1155Info.abi, contract);
  return await clothContract.methods.getTokenIdForURI(uri).call();
}
// setMarketData();
// setNFTData();

async function getCollectionInfo(name) {
  const colData = await axios.post(
    process.env.ADMIN_URL + '/getCollectionInfo',
    {
      name
    },
    { 'Content-Type': `application/json` }
  );

  if (colData.data.status == false) {
    return null;
  }

  let collectionInfo = colData.data.data;
  let collectionAddress = collectionInfo.collection_address;
  let nft_type = collectionInfo.collection_type;
  return {
    collectionInfo,
    collectionAddress,
    nft_type
  };
}

const runTransaction = async (contractAddress, tx) => {
  let tryCnt = 0;
  while (tryCnt < 5) {
    try {
      let gas = await tx.estimateGas({
        from: process.env.MATIC_WALLET_ADDRESS
      });
      let data = tx.encodeABI();
      let nonce = await web3.eth.getTransactionCount(
        process.env.MATIC_WALLET_ADDRESS,
        'latest'
      ); //get latest nonce
      if (nonce <= latestNonce) {
        nonce = latestNonce + 1;
      }
      latestNonce = nonce;
      let gasPrice = await web3.eth.getGasPrice();
      let chainId = PolygonChainId;

      let signedTx = await web3.eth.accounts.signTransaction(
        {
          to: contractAddress,
          data,
          gas: gas * 2,
          gasPrice,
          nonce,
          chainId
        },
        process.env.MATIC_WALLET_PRIVATEKEY
      );
      let transactionReceipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      return transactionReceipt;
    } catch (e) {
      console.log(e);
      console.log(JSON.stringify(e));
    }
    tryCnt++;
  }
  return false;
};

router.post('/setTokenSellable', async function (req, res) {
  const token_id = req.body.tokenId;
  const sellable = parseInt(req.body.sellable);
  const clothing_collection = await getCollectionInfo('VSX_CLOTHING');
  console.log('setTokenSellable');
  if (!clothing_collection) {
    return res.send({
      status: false,
      msg: 'The clothing collection does not exist.'
    });
  }

  let clothingContract = new web3.eth.Contract(
    VersusX1155Info.abi,
    clothing_collection.collectionAddress
  );

  try {
    let tx = await clothingContract.methods.setTokenSellable(
      token_id,
      sellable == 1
    );

    await runTransaction(clothing_collection.collectionAddress, tx);

    // Update metadata
    // 1. Get uri of token id from contract
    const uri = await clothingContract.methods.uri(token_id).call();

    // 2. fetch and decode metadata, update sellable property
    let nftMetadata = (await axiosGet(uri)).data;
    console.log(nftMetadata);
    nftMetadata.sellable = sellable;

    // 3. upload updated metadata to pindata
    const pinataResponse = await pinJSONToIPFS(nftMetadata);
    if (!pinataResponse.success) {
      return res.send({
        status: false,
        msg: 'Pinata failed.'
      });
    }

    const new_url = pinataResponse.pinataUrl;
    try {
      const uidRows = await knex('clothing')
        .where('uid', nftMetadata.uid)
        .select('id');
      if (uidRows.length) {
        await knex('clothing').where('uid', nftMetadata.uid).update({
          token_uri: new_url,
          metadata: nftMetadata
        });
      }
    } catch (e) {
      console.log(e);
    }

    let update_token_uri_tx = await clothingContract.methods.updateTokenUri(
      token_id,
      new_url
    );
    await runTransaction(
      clothing_collection.collectionAddress,
      update_token_uri_tx
    );

    return res.json({
      status: true,
      msg: 'Successfully set'
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      msg: 'Error at setting at contract'
    });
  }
});

router.post('/getTokenSellable', async function (req, res) {
  const token_id = req.body.tokenId;
  const clothing_collection = await getCollectionInfo('VSX_CLOTHING');
  if (!clothing_collection) {
    return res.send({
      status: false,
      msg: 'The clothing collection does not exist.'
    });
  }

  let clothingContract = new web3.eth.Contract(
    VersusX1155Info.abi,
    clothing_collection.collectionAddress
  );

  try {
    const value = await clothingContract.methods
      .getTokenSellable(token_id)
      .call();
    return res.json({
      status: true,
      data: value
    });
  } catch (e) {
    return res.json({
      status: false,
      msg: 'Error at getting at contract'
    });
  }
});

router.post('/setAvatarSellable', async function (req, res) {
  const token_id = req.body.tokenId;
  const sellable = parseInt(req.body.sellable);
  const avatar_collection = await getCollectionInfo('VSX_AVATARS');
  if (!avatar_collection) {
    return res.send({
      status: false,
      msg: 'The avatar collection does not exist.'
    });
  }

  let avatarContract = new web3.eth.Contract(
    VersusX721Info.abi,
    avatar_collection.collectionAddress
  );

  try {
    let tx = await avatarContract.methods.setTokenSellable(
      token_id,
      sellable == 1
    );

    await runTransaction(avatar_collection.collectionAddress, tx);

    // Update metadata
    // 1. Get uri of token id from contract
    const uri = await avatarContract.methods.uri(token_id).call();

    // 2. fetch and decode metadata, update sellable property
    let nftMetadata = (await axiosGet(nftInfo)).data;
    console.log(nftMetadata);
    nftMetadata.sellable = sellable;

    // 3. upload updated metadata to pindata
    const pinataResponse = await pinJSONToIPFS(data);
    if (!pinataResponse.success) {
      res.send({
        status: false,
        msg: 'Pinata failed.'
      });
    }

    const new_url = pinataResponse.pinataUrl;
    await knex('clothing').where('uid', metaObj.uid).update({
      token_uri: new_url,
      metadata: nftMetadata
    });

    let update_token_uri_tx = await avatarContract.methods.updateTokenUri(
      token_id,
      new_url
    );
    await runTransaction(update_token_uri_tx);
    return res.json({
      status: true,
      msg: 'Successfully set'
    });
  } catch (e) {
    console.log(e);
    return res.json({
      status: false,
      msg: 'Error at setting at contract'
    });
  }
});

router.post('/getAvatarSellable', async function (req, res) {
  const token_id = req.body.tokenId;
  const avatar_collection = await getCollectionInfo('VSX_AVATARS');
  if (!avatar_collection) {
    return res.send({
      status: false,
      msg: 'The avatar collection does not exist.'
    });
  }

  let avatarContract = new web3.eth.Contract(
    VersusX721Info.abi,
    avatar_collection.collectionAddress
  );

  try {
    const value = await avatarContract.methods
      .getTokenSellable(token_id)
      .call();
    return res.json({
      status: true,
      data: value
    });
  } catch (e) {
    return res.json({
      status: false,
      msg: 'Error at getting at contract'
    });
  }
});

router.post('/bundleAvatar', async function (req, res) {
  const userAddress = req.body.address;
  const token_id = req.body.tokenId;

  const avatar_collection = await getCollectionInfo('VSX_AVATARS');
  if (!avatar_collection) {
    return res.send({
      status: false,
      msg: 'The avatar collection does not exist.'
    });
  }

  const avatar_bundle_collection = await getCollectionInfo('VSX_AVATAR_BUNDLE');
  if (!avatar_bundle_collection) {
    return res.send({
      status: false,
      msg: 'The avatar bundle collection does not exist.'
    });
  }

  // check if user owns avatar
  let avatarContract = new web3.eth.Contract(
    VersusX721Info.abi,
    avatar_collection.collectionAddress
  );

  const ownerAddress = await avatarContract.methods.ownerOf(token_id).call();
  if (userAddress != ownerAddress) {
    return res.send({
      status: false,
      msg: 'User is not the owner of avatar'
    });
  }

  // prepare metadata for avatar bundle

  const nftInfo = await avatarContract.methods.tokenURI(token_id).call();
  let metadata = await axiosGet(nftInfo);
  metadata = metadata.data;

  let avatarBundleMetadata = {
    name: 'Avatar Bundle - ' + AvatarName,
    image_url: metadata.image_url,
    AvatarName: metadata.name,
    AvatarPFP: metadata.image_url,
    AvatarUID: metadata.uid,
    AvatarMetadata: nftInfo
  };

  let clothes = ['upper_clothing', 'lower_clothing', 'footwear', 'accessory'];
  let itemNames = ['Upper', 'Lower', 'Footwear', 'Accessory'];
  for (let i = 0; i < clothes.length; i++) {
    const cloth = clothes[i];
    avatarBundleMetadata[itemNames[i] + 'Name'] = 'empty';
    avatarBundleMetadata[itemNames[i] + 'PFP'] = 'empty';
    avatarBundleMetadata[itemNames[i] + 'UID'] = 'empty';
    const uid = metadata[cloth];
    if (!uid) {
      continue;
    }
    try {
      const nft = await findClothBasedOnUID(uid);
      if (!nft) continue;
      avatarBundleMetadata[itemNames[i] + 'Name'] = nft.metadata.name;
      avatarBundleMetadata[itemNames[i] + 'PFP'] = nft.metadata.image_url;
      avatarBundleMetadata[itemNames[i] + 'UID'] = nft.metadata.uid;
    } catch (e) {
      console.log(e);
    }
  }

  const pinataResponse = await pinJSONToIPFS(avatarBundleMetadata);
  if (!pinataResponse.success) {
    return res.json({
      status: false,
      msg: 'Uploading metadata to Pindata failed'
    });
  }
  try {
    let created = await _createAvatarNFT(
      avatar_bundle_collection.nft_type,
      avatar_bundle_collection.collectionAddress,
      userAddress,
      1,
      pinataResponse.pinataUrl
    );
    if (created.result) {
      return res.json({
        status: true,
        msg: 'Successfully bundled'
      });
    }
    return res.json({
      status: false,
      msg:
        'Error happened during creating avatar at line 2348: ' + created.error
    });
  } catch (e) {
    return res.json({
      status: false,
      msg: 'Error happened during creating avatar at line 2351'
    });
  }
});

router.post('/unlockAvatar', async function (req, res) {
  const userAddress = req.body.address;
  const token_id = req.body.tokenId;

  const avatar_collection = await getCollectionInfo('VSX_AVATARS');
  if (!avatar_collection) {
    return res.send({
      status: false,
      msg: 'The avatar collection does not exist.'
    });
  }

  const avatar_bundle_collection = await getCollectionInfo('VSX_AVATAR_BUNDLE');
  if (!avatar_bundle_collection) {
    return res.send({
      status: false,
      msg: 'The avatar bundle collection does not exist.'
    });
  }

  // check if user owns avatar
  let avatarBundleContract = new web3.eth.Contract(
    VersusX721Info.abi,
    avatar_collection.collectionAddress
  );

  const ownerAddress = await avatarBundleContract.methods
    .ownerOf(token_id)
    .call();
  if (userAddress != ownerAddress) {
    return res.send({
      status: false,
      msg: 'User is not the owner of avatar bundle'
    });
  }

  // extract metadata from avatar bundle
  const nftInfo = await avatarContract.methods.tokenURI(token_id).call();
  let metadata = await axiosGet(nftInfo);
  metadata = metadata.data;

  let itemNames = ['Upper', 'Lower', 'Footwear', 'Accessory'];
  for (let i = 0; i < itemNames.length; i++) {
    const cloth = itemNames[i];
    const uid = metadata[cloth + 'UID'];
    if (!uid) {
      continue;
    }
    try {
      const nft = await findClothBasedOnUID(uid);
      if (!nft) continue;
      await _createAvatarNFT(
        'ERC1155',
        nft.contract,
        userAddress,
        1,
        nft.tokenURI
      );
    } catch (e) {
      console.log(e);
    }
  }
  await _createAvatarNFT(
    'ERC721',
    avatar_collection.collectionAddress,
    userAddress,
    1,
    metadata['AvatarMetadata']
  );
  if (!result) {
    res.json({
      status: false,
      msg: 'Error at avatar minting'
    });
    return;
  }
  res.json({
    status: true,
    msg: 'Successfully unlocked avatar'
  });
});

module.exports = router;
