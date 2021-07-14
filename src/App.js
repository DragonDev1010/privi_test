import { reject } from 'q'
import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import {recoverTypedSignature_v4} from 'eth-sig-util'
const msgParams = JSON.stringify({
	domain: {
		// Defining the chain aka Rinkeby testnet or Ethereum Main Net
		chainId: 97,
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
			"Function": "mint",
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
});
class App extends Component {
	componentWillMount() {
		this.loadBlockchainData()
	}

	async loadBlockchainData() {
		// const web3 = new Web3(Web3.givenProvider || "HTTP://127.0.0.1:7545")
		// const accounts = await web3.eth.getAccounts()
		// this.setState({ account: accounts[0] })
	}

	constructor(props) {
		super(props)
		this.state = { account: '', signResult: ''}
		this.sign = this.sign.bind(this)
		this.verify = this.verify.bind(this)
	}
	async sign() {
		const web3 = new Web3(Web3.givenProvider || "HTTP://127.0.0.1:7545")
		const accounts = await web3.eth.getAccounts()
		var from = accounts[0]
	
		var params = [from, msgParams];
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
		promise.then(value => {
			this.setState({
				signResult: value
			}) 
		})
	}
  async verify() {
		const msgSender = recoverTypedSignature_v4(msgParams, "0x392ecba2b9e2f4023e90e8da043d47c5e3a7cd4974d58f4863889a00d7521cb669dc10187ecb1cd2df15f88484dbd1b8a8e6de4062580207feaf8a06c98fc5931c")
		console.log(this.state.signResult)
	}
	render() {
		return (
		<div className="container">
			<h1>Hello, World!</h1>
			<p>Your account: {this.state.account}</p>
			<button onClick = {this.sign}>Sign</button>
			<button onClick = {this.verify}>verify</button>
		</div>
		);
	}
}

export default App;
