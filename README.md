# EtherLotto

A simple Ethereum Dapp (Distributed Application) using the [Truffle Framework](http://truffleframework.com/) to play Lotto with other users.

## Rules v2

* Users have to bid fixed amount of EtherLotto (0.2 ETH)
* Users can choose number to bid on (number between 1-999)
* after a predefined period of time, a random number will be generated
* if any user submitted the generated number with his bid, he wins and can withdraw the whole pot
* if there are two or more winners, the pot gets split
* if there are no winners, the pot can be won during the next round

## Random Generation

The random will be generated from the next blockhash.
This is potentially manipulateable, because miners could influence the next blockhash.
But for small amounts of money, the manipulation is not feasable.


## Todo

* terminal application to automatically transition between states
* possible: python, node, geth (https://github.com/ethereum/go-ethereum)

## Setup

### General

Requires npm.

```
npm install -g truffle
npm install -g @angular/cli
git clone https://github.com/winterwurzel/EtherLotto.git && cd web
npm install
```

### Running tests

```
cd web
truffle develop
test
```

### Running the Webapp

To run the Webapp, a lokal Ethereum Testnetwork is currently needed. While [Truffle](http://truffleframework.com/) comes with a Testnetwork, [Ganache](http://truffleframework.com/ganache/) is the preferred App to provide it.

Either start the [Truffle](http://truffleframework.com/) Testnetwork with `truffle develop` or run [Ganache](http://truffleframework.com/ganache/) (preferred).

Additionally the Browser Extension [MetaMask](https://metamask.io/) is needed.
Install and configure [MetaMask](https://metamask.io/) to use the Local Testnetwork and import the first Account through the Mnemonic specified in `truffle develop` or  [Ganache](http://truffleframework.com/ganache/).
Additional Accounts can be import through their private keys. 

```
cd web
truffle compile
truffle migrate
npm run dev
```

Now the Webapp will be available at localthost:8080.
