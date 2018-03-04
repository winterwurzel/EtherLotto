const Web3 = require('web3');
const util = require('ethereumjs-util');
const Tx = require('ethereumjs-tx');

const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'));

// insert your Ethereum address and private key here
const address = '0x8cd4543757e67a5bC13dBE6f81D12eA7aaaC8D69';
// private key for rinkeby account, extracted with https://www.myetherwallet.com/#view-wallet-info
const privateKey = Buffer.from('d7036b90c29e579cb5d901b32b8e3db188493e92cbc1cc03258f53b31e99f834', 'hex');

// insert your the contract address here
const contractAddress = '0x31eaD75Db8e28259E6b89827D74EbEAFC6632081';

const interface = [ { "constant": true, "inputs": [], "name": "getPastWinnersCount", "outputs": [ { "name": "pastWinnersCount", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getState", "outputs": [ { "name": "_state", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_luckyNumber", "type": "uint256" } ], "name": "bid", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "clear", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getPotBalance", "outputs": [ { "name": "potBalance", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getPlayersCount", "outputs": [ { "name": "playersCount", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getDuration", "outputs": [ { "name": "_duration", "type": "uint256", "value": "432000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "chooseWinner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_maximum", "type": "uint256" } ], "name": "getRandom", "outputs": [ { "name": "random", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "setNextState", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getCreationTime", "outputs": [ { "name": "_creationTime", "type": "uint256", "value": "1516030557" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "i", "type": "uint256" } ], "name": "getPastWinnerData", "outputs": [ { "name": "id", "type": "address", "value": "0x" }, { "name": "luckyNumber", "type": "uint256", "value": "0" }, { "name": "amount", "type": "uint256", "value": "0" }, { "name": "winningTime", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "id", "type": "address" }, { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "luckyNumber", "type": "uint256" } ], "name": "NewBidRecieved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "random", "type": "uint256" } ], "name": "CalculatedNewRandom", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "state", "type": "uint8" } ], "name": "StateChanged", "type": "event" } ];

const contract = new web3.eth.Contract(interface, contractAddress);
const encodedABI = contract.methods.chooseWinner().encodeABI();

const loop = async () => {
    let durationTime = await contract.methods.getDuration().call();
    let startTime = await contract.methods.getCreationTime().call();
    let endTime = new Date((Number(startTime) + Number(durationTime)) * 1000);
    let now = new Date();

    // var state = await contract.methods.getState().call();
    if (now > endTime) {
        console.log(new Date() + ' - choosing winner, endTime: ' + endTime);     
        
        var txCount = await web3.eth.getTransactionCount(address);
        console.log(new Date() + ' - transactions: ' + txCount);

        var rawTx = {
            nonce: web3.utils.toHex(txCount),
            to: contractAddress,
            gasPrice: web3.utils.toHex(20000000000), 
            gasLimit: web3.utils.toHex(5000000),
            data: encodedABI
        }
                
        var tx = new Tx(rawTx);
        tx.sign(privateKey);

        var serializedTx = tx.serialize();
                
        var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        console.log(receipt);
    } else {
        console.log(new Date() + ' - nothing to do, endTime: ' + endTime.toLocaleString());
    }
    setTimeout(loop, 1000 * 60); // 1000 milliseconds * 60 = 1 minute
}

loop();
