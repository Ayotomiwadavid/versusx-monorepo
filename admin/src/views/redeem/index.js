import { ethers } from 'ethers'
import { CCard, CCardBody, CCardHeader, CButton, CContainer, CCol, CRow, CFormInput } from '@coreui/react'
import React, { useState } from 'react'
const Web3 = require('web3')
const HolopassNFTInfo = require('./../../ABIs/HolopassNFT.json')

export default function RedeemPage() {
  const [balance, setBalance] = useState('')
  const [address, setAddress] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [resultMsg, setResultMsg] = useState('')
  const [burnSetResultMsg, setBurnSetResultMsg] = useState('')
  const [burnAddress, setBurnAddress] = useState('')

  async function onRedeem() {
    const web3 = new Web3(window.ethereum)
    const accounts = await web3.eth.getAccounts()
    const senderAddress = accounts[0]
    console.log(senderAddress)
    const nftContract = new web3.eth.Contract(HolopassNFTInfo, process.env.REACT_APP_HOLOPASS_NFT)
    const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest') //get latest nonce
    const gasPrice = await web3.eth.getGasPrice()
    const chainId = 137
    let tx = nftContract.methods.redeem(userAddress, 1)
    let gas = await tx.estimateGas({ from: senderAddress })
    let data = tx.encodeABI()
    let transactionReceipt = await web3.eth.sendTransaction({
      from: senderAddress,
      to: process.env.REACT_APP_HOLOPASS_NFT,
      data,
      gas: gas * 2,
      gasPrice,
      maxPriorityFeePerGas: gasPrice * 2,
      nonce,
      chainId,
    })

    setResultMsg(`Mint successful, hash: ${transactionReceipt.transactionHash}`)
  }

  async function onSetBurnAddress() {
    const web3 = new Web3(window.ethereum)
    const accounts = await web3.eth.getAccounts()
    const senderAddress = accounts[0]
    console.log(senderAddress)
    const nftContract = new web3.eth.Contract(HolopassNFTInfo, process.env.REACT_APP_HOLOPASS_NFT)
    const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest') //get latest nonce
    const gasPrice = await web3.eth.getGasPrice()
    const chainId = 137
    let tx = nftContract.methods.setBurnAddress(burnAddress)
    let gas = await tx.estimateGas({ from: senderAddress })
    let data = tx.encodeABI()
    let transactionReceipt = await web3.eth.sendTransaction({
      from: senderAddress,
      to: process.env.REACT_APP_HOLOPASS_NFT,
      data,
      gas: gas * 2,
      gasPrice,
      maxPriorityFeePerGas: gasPrice * 2,
      nonce,
      chainId,
    })

    setBurnSetResultMsg(`Set successful, hash: ${transactionReceipt.transactionHash}`)
  }

  async function connectWallet() {
    const chainId = 137

    try {
      if (window.ethereum) {
        console.log(window.ethereum, window.ethereum.networkVersion)
        var web3Window = new Web3(window.ethereum)
        if (window.ethereum.networkVersion !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              //params: [{ chainId: web3.utils.toHex(chainId) }],
              params: [{ chainId: '0x' + chainId.toString(16) }],
            })
            if (address === '') {
              await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [
                  {
                    eth_accounts: {},
                  },
                ],
              })
              const addressArray = await window.ethereum.request({ method: 'eth_accounts' })
              if (addressArray.length > 0) {
                setAddress(addressArray[0])
                web3Window.eth.getBalance(addressArray[0], (err, balanceOf) => {
                  let balETH = ethers.utils.formatUnits(balanceOf, 'ether')
                  setBalance(String(balETH).substring(0, 6) + ' ETH')
                })
              }
            } else {
              setAddress('')
              setBalance('')
            }
          } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask.
            // if (err.code ==== 4902) {
            //   await window.ethereum.request({
            //     method: 'wallet_addEthereumChain',
            //     params: [
            //       {
            //         chainName: 'Ropsten TestNet',
            //         chainId: web3.utils.toHex(chainId),
            //         nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
            //         rpcUrls: ['https://ropsten.infura.io/v3/'],
            //       },
            //     ],
            //   });
            // }
          }
        } else {
          if (address === '') {
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [
                {
                  eth_accounts: {},
                },
              ],
            })
            const addressArray = await window.ethereum.request({ method: 'eth_accounts' })
            if (addressArray.length > 0) {
              setAddress(addressArray[0])
              web3Window.eth.getBalance(addressArray[0], (err, balanceOf) => {
                let balETH = ethers.utils.formatUnits(balanceOf, 'ether')
                setBalance(String(balETH).substring(0, 6) + ' ETH')
              })
            }
          } else {
            setAddress('')
            setBalance('')
          }
        }
      }
    } catch (e) {
      console.log(e)
      return
    }
  }

  return (
    <>
      <CContainer className="mb-4">
        <CButton onClick={() => connectWallet()}>{address.length === 0 ? 'Connect Wallet' : 'Disconnect'} </CButton>
        {address.length === 0 ? (
          ''
        ) : (
          <span className="m-4">
            Balance: <b>{balance}</b>
          </span>
        )}
      </CContainer>
      <CCard className="mb-4">
        <CCardHeader>Holopass NFT Mint</CCardHeader>
        <CCardBody>
          <CRow>
            <CCol xs={6}>
              <CFormInput
                type="text"
                size="sm"
                id="userAddress"
                placeholder="User wallet address"
                value={userAddress}
                onChange={(event) => {
                  setUserAddress(event.target.value)
                }}
              />
            </CCol>
            <CCol xs={6}>
              <CButton onClick={() => onRedeem()}>Redeem / Mint</CButton>
            </CCol>
          </CRow>
          <p>{resultMsg}</p>
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <CCardHeader>Set Burn Address</CCardHeader>
        <CCardBody>
          <CRow>
            <CCol xs={6}>
              <CFormInput
                type="text"
                size="sm"
                id="burnAddress"
                placeholder="User wallet address"
                value={burnAddress}
                onChange={(event) => {
                  setBurnAddress(event.target.value)
                }}
              />
            </CCol>
            <CCol xs={6}>
              <CButton onClick={() => onSetBurnAddress()}>Set Burn Address</CButton>
            </CCol>
          </CRow>
          <p>{burnSetResultMsg}</p>
        </CCardBody>
      </CCard>
    </>
  )
}
