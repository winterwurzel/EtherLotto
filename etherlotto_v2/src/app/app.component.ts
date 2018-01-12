import { Component, HostListener, NgZone, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
const Web3 = require('web3');
const contract = require('truffle-contract');
const etherLottoArtifacts = require('../../build/contracts/EtherLotto.json');

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  EtherLotto = contract(etherLottoArtifacts);

  account: any;
  accounts: any;
  web3: any;

  status: string;
  luckyNumber: number;
  pastWinnerNumber: number;

  displayedColumns = ['position', 'address', 'luckyNumber', 'amountWon', 'winningTime'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatSort) sort: MatSort;

  constructor(private _ngZone: NgZone) {

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
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
        'No web3 detected. Falling back to http://localhost:8545.' +
        'More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
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

      this.getBalance();
      this.getPastWinnersCount();
    });
  };

  setStatus = message => {
    this.status = message;
  };

  withdraw = () => {
    this.EtherLotto
      .deployed()
      .then(instance => {
        return instance.withdraw({from: this.account});
    }).then(() => {
      console.log('Withdraw complete!');
      this.getBalance();
    }).catch(function(e) {
      console.log(e);
      this.setStatus('Error withdrawing coins; see log.');
    });
  };

  play = () => {
    const amount = this.web3.toWei(0.2, 'ether');

    console.log(this.account);

    this.EtherLotto.deployed().then(instance => {
      console.log(this.luckyNumber);
      return instance.bid(this.luckyNumber, {from: this.account, value: amount})
        .then(result => {
          for (let i = 0; i < result.logs.length; i++) {
            let log = result.logs[i];

            if (log.event === 'NewBidRecieved') {
              console.log('player: ', log.args.id);
              console.log('luckyNumber: ', log.args.luckyNumber.toNumber());
              console.log('index: ', log.args.index.toNumber());
              console.log('amount: ', this.web3.fromWei(log.args.amount.toNumber()));
            }
            if (log.event === 'CalculatedNewRandom') {
              console.log('random: ', log.args.random.toNumber());
            }
          }
      });
    }).then(() => {
      console.log('Transaction complete!');
      this.getBalance();
    }).catch(e => {
      console.log(e);
      this.setStatus('Error sending coins; see log.');
    });
  };

  getPotBalance = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getPotBalance()
      .then(result => {
        console.log('Pot Balance: ' + result);
      });
    });
  };

  getPlayersCount = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getPlayersCount()
      .then(result => {
        console.log('Players Count: ' + result);
      });
    });
  };

  getPastWinnersCount = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getPastWinnersCount()
      .then(result => {
        console.log('Past Winners Count: ' + result);
        for (let i = 0; i < Number(result); i++) {
          this.getPastWinnerData(0);
        }
      });
    });
  };

  buttonPastWinnerData = () => {
    this.getPastWinnerData(this.pastWinnerNumber);
  }

  getPastWinnerData = pastWinnerNumber => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getPastWinnerData(pastWinnerNumber)
      .then(result => {
        console.log('Past Winners Data: ' + result);
        const results = ('' + result).split(',');

        this._ngZone.run(() => {
          this.dataSource.data.push(new Winner(this.dataSource.data.length + 1,
            results[0], Number(results[1]), Number(results[2]), results[3]));
          this.dataSource._updateChangeSubscription();
          console.log(this.dataSource.data);
        });
      });
    });
  };

  getDuration = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getDuration()
      .then(result => {
        console.log('Duration: ' + result);
      });
    });
  };

  getCreationTime = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getCreationTime()
      .then(result => {
        console.log('Creation Time: ' + result);
      });
    });
  };

  chooseWinner = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.chooseWinner({from: this.account})
        .then(result => {
        for (let i = 0; i < result.logs.length; i++) {
          const log = result.logs[i];
          if (log.event === 'CalculatedNewRandom') {
            console.log('random: ', log.args.random.toNumber());
          }
        }
      });
    });
  };

  setNextState = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.setNextState({from: this.account});
    });
  };

  getState = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getState()
      .then(result => {
        console.log('State: ' + result);
      });
    });
  };


  getBalance = () => {
    this.web3.eth.getBalance(this.account, (err, result) => {
      if (!err) {
        const bal = 'Current Balance: ' + this.web3.fromWei(result.toNumber()) + ' ETH';
        this._ngZone.run(() => {
          this.setStatus(bal);
        });
      } else {
        console.error(err);
      }
    });
  };
}

export class Winner {
  position: number;
  address: string;
  luckyNumber: number;
  amountWon: number;
  winningTime: string;

  constructor(position: number, address: string, luckyNumber: number, amountWon: number, winningTime: string) {
    this.position = position;
    this.address = address;
    this.luckyNumber = luckyNumber;
    this.amountWon = amountWon;
    this.winningTime = winningTime;
  }
}

