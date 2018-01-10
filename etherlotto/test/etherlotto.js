var EtherLotto = artifacts.require("EtherLotto");

contract('EtherLotto', function(accounts) {
  it("test contract deployed", function() {
    return EtherLotto.deployed().then(function(instance) {
      assert(instance != undefined, "contract is not correctly deployed");
    });
  });

  it("test pot balance after one bid", function() {
    var etherLotto;
    var expectedBid = 200000000000000000;

    return EtherLotto.deployed().then(function(instance) {
      etherLotto = instance;
      return etherLotto.bid({from: accounts[0], value: expectedBid});
    }).then(function(result) {

      var recievedBidValue;
      var recievedPlayerAddress;

      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "NewBidRecieved") {
          recievedPlayerAddress = log.args.player;
          recievedBidValue = log.args.amount.toNumber();
        }
      }

      assert.equal(recievedPlayerAddress, accounts[0], "address from event and sender address need to match");
      assert.equal(recievedBidValue, expectedBid, "bid value from event and sent bid have to match");

      return etherLotto.getPotBalance();
    }).then(function(balance) {
      assert.equal(balance.toNumber(), expectedBid, "wrong value in potBalance, bid went wrong");
    });
  });
});


contract('EtherLotto', function(accounts) {
  it("test a full lottery", function() {
    var etherLotto;
    var winner;
    var bid = 200000000000000000;
    var balances = new Array();
    var winnerBalance;

    return EtherLotto.deployed().then(function(instance) {
      etherLotto = instance;
      return etherLotto.bid({from: accounts[0], value: bid});
    }).then(function() {
      balances.push(web3.eth.getBalance(accounts[0]).toNumber());
      return etherLotto.bid({from: accounts[1], value: bid});
    }).then(function() {
      balances.push(web3.eth.getBalance(accounts[1]).toNumber());
      return etherLotto.bid({from: accounts[2], value: bid});
    }).then(function() {
      balances.push(web3.eth.getBalance(accounts[2]).toNumber());
      return etherLotto.bid({from: accounts[3], value: bid});
    }).then(function() {
      balances.push(web3.eth.getBalance(accounts[3]).toNumber());
      return etherLotto.bid({from: accounts[4], value: bid});
    }).then(function(result) {
      balances.push(web3.eth.getBalance(accounts[4]).toNumber());

      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "CalculatedNewRandom") {
          winner = log.args.random.toNumber()
        }
      }
    }).then(function() {
      return etherLotto.withdraw({from: accounts[winner]});
    }).then(function() {
      winnerBalance = web3.eth.getBalance(accounts[winner]).toNumber();
      winnerBalance = parseInt(winnerBalance / 1000000000000000000);

      var expectedWinnerBalance = balances[winner] + bid * 5;
      expectedWinnerBalance = parseInt(expectedWinnerBalance / 1000000000000000000);

      assert.equal(winnerBalance, expectedWinnerBalance, "winner did not recieve correct amount (possible error due to gas costs)");
    });
  });


});
