pragma solidity ^0.4.18;


contract EtherLotto {
    uint private pot = 0;
    uint private bidSize = 0.2 ether;
    uint private maximum = 3;
    //uint private maximum = 999;

    // This is the current stage.
    States private state = States.AcceptingBids;
    uint private creationTime = now;
    uint private duration = 15 minutes;

    enum States {
        AcceptingBids,
        ChooseWinner,
        Reset
    }

    struct Player {
        address id;
        uint index;
        uint luckyNumber;
    }

    Player[] private players;
    uint private playerIndex = 0;
    Player[] private winners;
    uint private winnerIndex = 0;
    mapping (address => uint) private pendingWithdrawals;

    struct PastWinner {
        Player player;
        uint amount;
        uint winningTime;
    }

    PastWinner[] private pastWinners;

    event NewBidRecieved(address id, uint index, uint amount, uint luckyNumber);
    event CalculatedNewRandom(uint random);
    event StateChanged(States state);

    modifier atState(States _state) {
        require(state == _state);
        _;
    }

    function nextState() internal {
        state = States(uint(state) + 1);
        StateChanged(state);
    }
    
    modifier transitionNext() {
        _;
        nextState();
    }
    
    modifier timedTransitions() {
        if (state == States.AcceptingBids && now >= creationTime + duration) // change to a few days
            nextState();
        // The other states transition by transaction
        _;
    }

    // ONLY FOR DEBUGGING
    function setNextState() public {
        nextState();
    }
    // ONLY FOR DEBUGGING
    function getState() public view returns(uint _state) {
        return uint(state);
    }

    function bid(uint _luckyNumber) public payable timedTransitions atState(States.AcceptingBids) {
        require(msg.value == bidSize);
        require(_luckyNumber != 0 && _luckyNumber < (maximum + 1)); 

        NewBidRecieved(msg.sender, playerIndex, msg.value, _luckyNumber);

        pot += msg.value;
        insertPlayer(Player(msg.sender, playerIndex, _luckyNumber));
    }

    function getRandom(uint _maximum) public view returns (uint random) {
        return uint(block.blockhash(block.number-1)) % _maximum + 1;
    }

    function checkSingleBidPerPlayer(address newPlayer) internal view returns(bool singleBid) {
        if (playerIndex == 0) {
            return true;
        }
        for (uint i = 0; i < playerIndex; i++) {
            if (players[i].id == newPlayer) {
                return false;
            }
        }
        return true;
    }

    function chooseWinner() public timedTransitions atState(States.ChooseWinner) {
        uint winningNumber = getRandom(maximum);

        CalculatedNewRandom(winningNumber);

        getWinners(winningNumber);

        if (winners.length > 0) {
            setPendingWithdrawals();
        }

        // transition to Reset state
        nextState();
        clear();
    }
    
    function setPendingWithdrawals() internal {
        uint potPerWinner = pot / winners.length;
        pot = 0;

        for (uint i = 0; i < winnerIndex; i++) {
            pendingWithdrawals[winners[i].id] += potPerWinner;
            pastWinners.push(PastWinner(winners[i], potPerWinner, now));
        }
    }

    function getWinners(uint winningNumber) internal {
        for (uint i = 0; i < playerIndex; i++) {
            if (players[i].luckyNumber == winningNumber) {
                insertWinner(players[i]);
            }
        }
    }

    function getDuration() public view returns (uint _duration) {
        return duration;
    }

    function getCreationTime() public view returns (uint _creationTime) {
        return creationTime;
    }

    function getPastWinnersCount() public view returns (uint pastWinnersCount) {
        return pastWinners.length;
    }

    function getPastWinnerData(uint i) public view returns (address id, uint luckyNumber, uint amount, uint winningTime) {
        return (pastWinners[i].player.id, pastWinners[i].player.luckyNumber, pastWinners[i].amount, pastWinners[i].winningTime);
    }

    function getPlayersCount() public view returns (uint playersCount) {
        return playerIndex;
    }

    function getPotBalance() public view returns (uint potBalance) {
        return pot;
    }

    function withdraw() public {
        uint amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function insertPlayer(Player newPlayer) internal {
        if (playerIndex == players.length) {
            players.length += 1;
        }
        players[playerIndex++] = newPlayer;
    }

    function insertWinner(Player winningPlayer) internal {
        if (winnerIndex == winners.length) {
            winners.length += 1;
        }
        winners[winnerIndex++] = winningPlayer;
    }

    function clear() public atState(States.Reset) {
        playerIndex = 0;
        players.length = 0;
        winnerIndex = 0;
        winners.length = 0;
        state = States.AcceptingBids;
        creationTime = now;
    }
}
