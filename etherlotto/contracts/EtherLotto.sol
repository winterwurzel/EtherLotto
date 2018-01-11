pragma solidity ^0.4.18;


contract EtherLotto {
    uint private pot = 0;
    uint private maxPlayers = 5;
    uint private playerIndex = 0;
    uint private bidSize = 0.2 ether;

    struct Player {
        address id;
        uint slot;
    }

    Player[] private players;
    Player private winner;
    mapping (address => uint) private pendingWithdrawals;

    event NewBidRecieved(address player, uint amount);
    event CalculatedNewRandom(uint random);

    function bid() public payable {
        NewBidRecieved(msg.sender, msg.value);
        require(msg.value == bidSize);
        // require(checkSingleBidPerPlayer(msg.sender) == true);

        pot += msg.value;
        insertPlayer(Player(msg.sender, playerIndex));

        if (players.length >= maxPlayers) {
            uint random = getRandom(maxPlayers);
            CalculatedNewRandom(random);

            winner = players[random];

            pendingWithdrawals[winner.id] += pot;

            clear();
        }
    }

    // remove before live
    function getPlayersLength() public view returns(uint length) {
        return playerIndex;
    }

    // remove before live
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

    function getRandom(uint maximum) public view returns (uint random) {
        return uint(block.blockhash(block.number-1))%maximum;
    }

    function insertPlayer(Player newPlayer) internal {
        if (playerIndex == players.length) {
            players.length += 1;
        }
        players[playerIndex++] = newPlayer;
    }

    // disabled for now
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

    function clear() internal {
        playerIndex = 0;
        pot = 0;
        players.length = 0;
    }
}
