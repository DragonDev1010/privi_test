import { reject } from 'q'
import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
var EthSigUtil = require('eth-sig-util')
var web3, accounts
const msgParams = {
    domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: 1,
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Ether Mail',
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
    },
    // Defining the message signing data content.
    message: {
        Data: {
            "Function": "mintsdf",
            "Address": "0x4c6a375e66440949149720f273d69fcd11b1564b",
            "Signature": "0xblababl",
            "Payload": {
                "Type": "Initial supply",
                "Token": "pUSD",
                "From": "0x4c6a375e66440949149720f273d69fcd11b1564b",
                "To": "0xeec9c9550b46cc865dc550bc17097fb7653a82f8",
                "Amount": "1000"
            }
        },
        Caller: "PRIVI",
        /*
        - Anything you want. Just a JSON Blob that encodes the data you want to send
        - No required fields
        - This is DApp Specific
        - Be as explicit as possible when building out the message schema.
        */
    },
    primaryType: 'Mail',
    types: {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ],
        // Not an EIP712Domain definition
        Group: [
            { name: 'name', type: 'string' },
        ],
        // Refer to PrimaryType
        Mail: [
        ],
    },
}
class App extends Component {
	constructor(props) {
		super(props)
		this.state = { account: '', signResult: '', verified_acc: ''}
		this.sign = this.sign.bind(this)
		this.verify = this.verify.bind(this)
	}
	async sign() {
		// Check if Metamask is installed on the browser
		if(typeof window.ethereum === 'undefined') {
			console.log('please install metamask')
		} else {
			web3 = new Web3(Web3.givenProvider || "HTTP://127.0.0.1:7545")
			accounts = await web3.eth.getAccounts()
			// Check if Client unlock his wallet and connect this site to his wallet
			if(accounts.length == 0) {
				console.log('please unlock wallet and connect website')
				window.ethereum.request({method: 'eth_requestAccounts'})
			} else {
				var from = accounts[0]
				var params = [from, JSON.stringify(msgParams)];
				var method = 'eth_signTypedData_v4';  
				var res = ''
		
				const promise = new Promise((resolve, reject) => {
					web3.currentProvider.sendAsync(
						{
							method,
							params,
							from,
						},
						function (err, result) {
							if (err) return console.dir(err);
							if (result.error) {
								alert(result.error.message);
							}
							if (result.error) return console.error('ERROR', result);
							
							res = JSON.stringify(result.result)
							console.log('TYPED SIGNED:' + res);
							resolve(res)
						}
					);
				})
				// After successing in sign, change the component state
				promise.then(value => {
					this.setState({
						signResult: value
					}) 
				})
			}
		}
		this.setState({ account: accounts[0] })
	}
  	async verify() {
		var sig_val = this.state.signResult
		// Trim quotation (or double quotation) marks from start and end poing in this string
		var temp = sig_val.substring(1, sig_val.length-1)
		
		var verified_account = EthSigUtil.recoverTypedSignature_v4({
			data: msgParams,
			sig: temp
		})
		// Set component state with verified account address which is returned from `recoverTypedSignature_v4`
		this.setState({ verified_acc: verified_account })
		// Compare with two accounts in case-insensitive
		if(verified_account.toUpperCase() == accounts[0].toUpperCase()) {
			alert("Verification success")
		} else {
			alert("verification failed")
		}
	}
	render() {
		return (
		<div className="container">
			<h1>Signature and Verify</h1>
			<p>Your account: {this.state.account}</p>
			<p>Verified account: {this.state.verified_acc}</p>
			<button onClick = {this.sign}>Sign</button>
			<button onClick = {this.verify}>verify</button>
		</div>
		);
	}
}

export default App;
