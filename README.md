# EtherLotto

A simple Ethereum Dapp (Distributed Application) using the [Truffle Framework](http://truffleframework.com/) to play Lotto with other users.

## Rules

* Each Player can only bid the predefined value of 0.2 ETH.
* Each Player can only bid once. Enforced by checking the Players ETH Address is unique.
* After a predefined amount of bids (currently 5), a random winner will be picked.
* The Winner gets the whole Pot. In this case 5 * 0.2 = 1 ETH.

## Setup

### General

Requires npm.

```
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
