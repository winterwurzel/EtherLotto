import { Component, HostListener, NgZone } from '@angular/core';
const Web3 = require('web3');
const contract = require('truffle-contract');
const etherLottoArtifacts = require('../../build/contracts/EtherLotto.json');
import { canBeNumber } from '../util/validation';
import { log } from 'util';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  EtherLotto = contract(etherLottoArtifacts);

  // TODO add proper types these variables
  account: any;
  accounts: any;
  web3: any;

  balance: number;
  sendingAmount: number;
  recipientAddress: string;
  status: string;
  canBeNumber = canBeNumber;

  constructor(private _ngZone: NgZone) {

  }

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source.'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider('http://localhost:8545')
      );
    }
  };

  onReady = () => {
    // Bootstrap the MetaCoin abstraction for Use.
    this.EtherLotto.setProvider(this.web3.currentProvider);

    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
          'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
        );
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[0];
    });
  };

  withdraw = () => {
    this.EtherLotto
      .deployed()
      .then(instance => {
        return instance.withdraw({from: this.account}).then(bool => {
          console.log(bool);
      });
    }).then(() => {
      console.log('Withdraw complete!');
      // self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      // self.setStatus("Error sending coin; see log.");
    });
  };

  play = () => {
    const amount = 0.2 * Math.pow(10, 18);

    console.log(this.account);

    this.EtherLotto.deployed().then(instance => {
      return instance.bid({from: this.account, value: amount})
        .then(result => {
          for (let i = 0; i < result.logs.length; i++) {
            let log = result.logs[i];

            if (log.event === 'NewBidRecieved') {
              console.log('player: ', log.args.player);
              console.log('amount: ', log.args.amount.toNumber());
            }
            if (log.event === 'CalculatedNewRandom') {
              console.log('random: ', log.args.random.toNumber());
            }
          }
      });
    }).then(() => {
      console.log('Transaction complete!');
      // self.refreshBalance();
    }).catch(e => {
      console.log(e);
      // self.setStatus("Error sending coin; see log.");
    });
  };

  getBalance = () => {
    this.web3.eth.getBalance(this.account, (err, result) => {
      if (!err) {
          console.log(result.toNumber());
      } else {
          console.error(err);
      }
    });
  };

    // Get the initial account balance so it can be displayed.
    /*
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        alert(
          'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
        );
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[0];

      // This is run from window:load and ZoneJS is not aware of it we
      // need to use _ngZone.run() so that the UI updates on promise resolution
      this._ngZone.run(() =>
        this.refreshBalance()
      );
    });
  };

  refreshBalance = () => {
    let meta;
    this.EtherLotto
      .deployed()
      .then(instance => {
        meta = instance;
        return meta.getBalance.call(this.account, {
          from: this.account
        });
      })
      .then(value => {
        this.balance = value;
      })
      .catch(e => {
        console.log(e);
        this.setStatus('Error getting balance; see log.');
      });
  };

  setStatus = message => {
    this.status = message;
  };

  sendCoin = () => {
    const amount = this.sendingAmount;
    const receiver = this.recipientAddress;
    let meta;

    this.setStatus('Initiating transaction... (please wait)');

    this.EtherLotto
      .deployed()
      .then(instance => {
        meta = instance;
        return meta.sendCoin(receiver, amount, {
          from: this.account
        });
      })
      .then(() => {
        this.setStatus('Transaction complete!');
        this.refreshBalance();
      })
      .catch(e => {
        console.log(e);
        this.setStatus('Error sending coin; see log.');
      });
    */
}
