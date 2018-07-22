# EtherLotto

A simple Ethereum Dapp (Distributed Application) using the [Truffle Framework](http://truffleframework.com/) to play Lotto with other users.

[Repository with the Thesis Documentation](https://github.com/winterwurzel/master-thesis)
[Directlink to Thesis](https://github.com/winterwurzel/master-thesis/blob/master/tmp/thesis.pdf)

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


## Setup

### General

Requires npm.

```
npm install -g truffle
npm install -g @angular/cli
git clone https://github.com/winterwurzel/EtherLotto.git && cd etherlotto_v2
npm install
```

### Running tests

```
cd etherlotto_v2
truffle develop
test
```

### Running the Webapp

To run the Webapp, a lokal Ethereum Testnetwork is currently needed. While [Truffle](http://truffleframework.com/) comes with a Testnetwork, [Ganache](http://truffleframework.com/ganache/) is the preferred App to provide it.

Either start the [Truffle](http://truffleframework.com/) Testnetwork with `truffle develop` or run [Ganache](http://truffleframework.com/ganache/) (preferred).

Additionally the Browser Extension [MetaMask](https://metamask.io/) is needed.
Install and configure [MetaMask](https://metamask.io/) to use the Local Testnetwork (and port 7545) and import the first Account through the Mnemonic specified in `truffle develop` or  [Ganache](http://truffleframework.com/ganache/).
Additional Accounts can be import through their private keys. 

```
cd etherlotto_v2
truffle compile
truffle migrate
ng serve
```

Now the Webapp will be available at http://localhost:4200/.

### Running a local node server to automaticcally choose the winner and transition to next state
Choosing a winner and transitioning to the next state can also be done via the Dev Tools in the Webapp.


One local Ethereum address and private key as well as the contract address needs to be manually set.

```
cd node
npm install
node app.local.js
```

