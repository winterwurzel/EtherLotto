import { Component, HostListener, NgZone, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
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
  pot: string;
  endTime: string;
  luckyNumber: number;
  pastWinnerNumber: number;

  displayedColumns = ['position', 'address', 'luckyNumber', 'amountWon', 'winningTime'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _ngZone: NgZone) {

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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

      this.setWinnerData();
      this.refreshStats();
    });
  };

  setStatus = message => {
    this.status = message;
  };

  setPot = message => {
    this.pot = message;
  };

  setEndTime = message => {
    this.endTime = message;
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
      this.getPotBalance();
    }).catch(e => {
      console.log(e);
      this.setStatus('Error sending coins; see log.');
    });
  };

  refreshStats = async () => {
    await this.getPotBalance();
    await this.getBalance();
    await this.refreshEndTime();
    console.log('Refresh Finished');
  };

  refreshPotBalance = () => {
    this.getPotBalance();
    setTimeout(this.refreshPotBalance, 1000 * 60); // 1000 milliseconds * 60 = 1 minute
  };

  getPotBalance = async () => {
    let instance = await this.EtherLotto.deployed();
    let result = await instance.getPotBalance();
    const pot = 'Current Pot Balance: ' + this.web3.fromWei(Number(result), 'ether') + ' ETH';
    this.setPot(pot);
  };

  getPlayersCount = () => {
    this.EtherLotto.deployed().then(instance => {
      return instance.getPlayersCount()
      .then(result => {
        console.log('Players Count: ' + result);
      });
    });
  };

  getPastWinnersCount = async () => {
    let instance = await this.EtherLotto.deployed();
    let count = await instance.getPastWinnersCount();
    //console.log('Past Winners Count: ' + count);
    return count;
  };

  setWinnerData = async () => {
    let count = await this.getPastWinnersCount();
    for (let i = 0; i < Number(count); i++) {
      this.getPastWinnerData(i);
    }
  }

  refreshWinnerData = () => {
    this.dataSource = new MatTableDataSource();
    this.ngAfterViewInit();
    this.setWinnerData();
  }

  getPastWinnerData = async pastWinnerNumber => {
    let instance = await this.EtherLotto.deployed();
    let winnerData = await instance.getPastWinnerData(pastWinnerNumber);
    //console.log('Past Winners Data: ' + winnerData);
    const results = ('' + winnerData).split(',');

    this._ngZone.run(() => {
      this.dataSource.data.push(new Winner(this.dataSource.data.length + 1,
        results[0], Number(results[1]), this.web3.fromWei(Number(results[2]), 'ether'), this.getDateTimeString(results[3])));
      this.dataSource._updateChangeSubscription();
      //console.log(this.dataSource.data);
    });
  };

  getDuration = async () => {
    let instance = await this.EtherLotto.deployed();
    let durationTime = await instance.getDuration();
    //console.log('Duration: ' + durationTime + ' Seconds');

    return durationTime;
  };

  getCreationTime = async () => {
    let instance = await this.EtherLotto.deployed();
    let crTime = await instance.getCreationTime();
    //console.log('Creation Time: ' + crTime);

    return crTime;
  };

  getEndTime = async () => {
    let startTime = await this.getCreationTime();
    let durationTime = await this.getDuration();
    let endTime = Number(startTime) + Number(durationTime);
    //console.log('End Time for current Game: ' + endTime);

    return endTime;
  }

  refreshEndTime = async () => {
    let end = await this.getEndTime();
    let endFormat = this.getDateTimeString(end);

    this._ngZone.run(() => {
      this.setEndTime('Lottery ends at: ' + endFormat);
    });
  }

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
        const bal = 'Your Current Balance: ' + this.web3.fromWei(result.toNumber()) + ' ETH';
        this._ngZone.run(() => {
          this.setStatus(bal);
        });
      } else {
        console.error(err);
      }
    });
  };

  getDateTimeString = (unixTime) => {
    let iso = new Date();
    iso.setTime(unixTime * 1000);
    return iso.toLocaleString();
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

