// Import the page's CSS. Webpack will know what to do with it.
import "../css/scrolling-nav.css";
import 'bootstrap';

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import etherLotto_artifacts from '../../build/contracts/EtherLotto.json'

var EtherLotto = contract(etherLotto_artifacts);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the EtherLotto abstraction for Use.
    EtherLotto.setProvider(web3.currentProvider);

    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      // self.refreshBalance();
    });
  },

  // setStatus: function(message) {
  //   var status = document.getElementById("status");
  //   status.innerHTML = message;
  // },
  //
  // refreshBalance: function() {
  //   var self = this;
  //
  //   var meta;
  //   MetaCoin.deployed().then(function(instance) {
  //     meta = instance;
  //     return meta.getBalance.call(account, {from: account});
  //   }).then(function(value) {
  //     var balance_element = document.getElementById("balance");
  //     balance_element.innerHTML = value.valueOf();
  //   }).catch(function(e) {
  //     console.log(e);
  //     self.setStatus("Error getting balance; see log.");
  //   });
  // },

    getPotBalance: function() {
      var self = this;

      var lotto;

      EtherLotto.deployed().then(function(instance) {
        lotto = instance;
        console.log(lotto);
        lotto.getPotBalance({from: account}).then(function(pot) {
          console.log('current pot balance: ', pot.c[0]);
        });
      }).catch(function(e) {
        console.log("Something went wrong: " + e);
      });
    },

    getPlayers: function() {
      var self = this;

      var lotto;

      EtherLotto.deployed().then(function(instance) {
        lotto = instance;
        console.log(lotto);
        lotto.getPlayersLength({from: account}).then(function(pl) {
          console.log('current number of players: ', pl.c[0]);
        });
      }).catch(function(e) {
        console.log("Something went wrong: " + e);
      });
    },

  withdraw: function() {
    EtherLotto.deployed().then(function(instance) {
      return instance.withdraw({from: account}).then(function(bool) {
        console.log(bool);
      });
    }).then(function() {
      console.log("Withdraw complete!");
      // self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      // self.setStatus("Error sending coin; see log.");
    });
  },

  play: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);

    // this.setStatus("Initiating transaction... (please wait)");

    var lotto;
    EtherLotto.deployed().then(function(lotto) {
      console.log(account);
      console.log(amount);
      var eth = amount * Math.pow(10, 18);
      return lotto.bid({from: account, to: '0x345ca3e014aaf5dca488057592ee47305d9b3e10', value: eth}).then(function(result) {
        for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];

          if (log.event == "NewBidRecieved") {
            console.log('player: ', log.args.player);
            console.log('amount: ', log.args.amount.c[0]);
          }
          if (log.event == "CalculatedNewRandom") {
            console.log('random: ', log.args.random.c[0]);
          }
        }
      });
    }).then(function() {
      console.log("Transaction complete!");
      // self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      // self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof window.web3 !== 'undefined') {
    console.warn("Using web3 detected from external source.")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545.");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
