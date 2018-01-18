const Web3 = require('web3');
const util = require('ethereumjs-util');
const Tx = require('ethereumjs-tx');

const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:8545'));

const address = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
const privateKey = Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex');

const contractAddress = '0x2c2b9c9a4a25e24b174f26114e8926a9f2128fe4';

const interface = [ { "constant": true, "inputs": [], "name": "getPastWinnersCount", "outputs": [ { "name": "pastWinnersCount", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getState", "outputs": [ { "name": "_state", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_luckyNumber", "type": "uint256" } ], "name": "bid", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [], "name": "clear", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getPotBalance", "outputs": [ { "name": "potBalance", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getPlayersCount", "outputs": [ { "name": "playersCount", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getDuration", "outputs": [ { "name": "_duration", "type": "uint256", "value": "432000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "chooseWinner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_maximum", "type": "uint256" } ], "name": "getRandom", "outputs": [ { "name": "random", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "setNextState", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getCreationTime", "outputs": [ { "name": "_creationTime", "type": "uint256", "value": "1516030557" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "i", "type": "uint256" } ], "name": "getPastWinnerData", "outputs": [ { "name": "id", "type": "address", "value": "0x" }, { "name": "luckyNumber", "type": "uint256", "value": "0" }, { "name": "amount", "type": "uint256", "value": "0" }, { "name": "winningTime", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "id", "type": "address" }, { "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "luckyNumber", "type": "uint256" } ], "name": "NewBidRecieved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "random", "type": "uint256" } ], "name": "CalculatedNewRandom", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "state", "type": "uint8" } ], "name": "StateChanged", "type": "event" } ];

const contract = new web3.eth.Contract(interface, contractAddress);
const encodedABI = contract.methods.chooseWinner().encodeABI();

const loop = async () => {
    let durationTime = await contract.methods.getDuration().call();
    let startTime = await contract.methods.getCreationTime().call();
    let endTime = new Date((Number(startTime) + Number(durationTime)) * 1000);
    let now = new Date();

    // var state = await contract.methods.getState().call();
    if (now >= endTime) {
        console.log(new Date() + ' - choosing winner, endTime: ' + endTime);     
        
        var txCount = await web3.eth.getTransactionCount(address);
        console.log(new Date() + ' - transactions: ' + txCount);

        var rawTx = {
            nonce: web3.utils.toHex(txCount),
            to: contractAddress,
            gasPrice: web3.utils.toHex(20000000000), 
            gasLimit: web3.utils.toHex(500000),
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
    setTimeout(loop, 1000); // 1000 milliseconds
}

loop();
