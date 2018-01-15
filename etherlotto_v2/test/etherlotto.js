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
    var expectedLuckyNumber = 1;
    var expectedIndex = 0;

    return EtherLotto.deployed().then(function(instance) {
      etherLotto = instance;
      return etherLotto.bid(expectedLuckyNumber, {from: accounts[0], value: expectedBid});
    }).then(function(result) {

      var recievedBidValue;
      var recievedPlayerAddress;
      var recievedLuckyNumber;
      var recievedIndex;

      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "NewBidRecieved") {
          recievedPlayerAddress = log.args.id;
          recievedBidValue = log.args.amount.toNumber();
          recievedLuckyNumber = log.args.luckyNumber.toNumber();
          recievedIndex = log.args.index.toNumber();
        }
      }

      assert.equal(recievedPlayerAddress, accounts[0], "address from event and sender address need to match");
      assert.equal(recievedBidValue, expectedBid, "bid value from event and sent bid have to match");
      assert.equal(recievedIndex, expectedIndex, "index should match");
      assert.equal(recievedLuckyNumber, expectedLuckyNumber, "lucky Number should match");

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
    var bid = web3.toWei(0.2, 'ether');
    var balances = new Map();
    var winnerBalance;

    return EtherLotto.deployed().then(function(instance) {
      etherLotto = instance;
      return etherLotto.bid(1, {from: accounts[0], value: bid});
    }).then(function() {
      balances.set(accounts[0], web3.eth.getBalance(accounts[0]).toNumber());
      return etherLotto.bid(2, {from: accounts[1], value: bid});
    }).then(function() {
      balances.set(accounts[1], web3.eth.getBalance(accounts[1]).toNumber());
      return etherLotto.bid(3, {from: accounts[2], value: bid});
    }).then(function() {
      balances.set(accounts[2], web3.eth.getBalance(accounts[2]).toNumber());
      return etherLotto.setNextState();
    }).then(function() {
      return etherLotto.getState();
    }).then(function(state) {
      assert.equal(state.toNumber(), 1, "state should be 1");
      return etherLotto.chooseWinner();
    }).then(function(result) {

      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];

        if (log.event == "CalculatedNewRandom") {
          winner = log.args.random.toNumber()
        }
      }
    }).then(function() {
      return etherLotto.getState();
    }).then(function(state) {
      assert.equal(state.toNumber(), 0, "state should match");
      return etherLotto.getPastWinnerData(0);
    }).then(function(results) {
      winner = results[0];
      var winnerNumber = Number(results[1]);
      var winnerAmount = Number(results[2]);

      return etherLotto.withdraw({from: winner});
    }).then(function() {
      winnerBalance = web3.eth.getBalance(winner).toNumber();
      winnerBalance = parseInt(web3.fromWei(winnerBalance, 'ether'));

      var expectedWinnerBalance = balances.get(winner) + bid * 5;
      expectedWinnerBalance = parseInt(web3.fromWei(expectedWinnerBalance, 'ether'));

      assert.equal(winnerBalance, expectedWinnerBalance, "winner did not recieve correct amount (possible error due to gas costs)");
    });
  });


});
