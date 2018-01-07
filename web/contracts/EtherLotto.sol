pragma solidity ^0.4.18;


contract EtherLotto {
    uint private pot = 0;
    uint private maxPlayers = 5;
    uint private numElements = 0;

    struct Player {
        address id;
        uint slot;
    }

    Player[] public players;
    Player private winner;
    mapping (address => uint) private pendingWithdrawals;

    event NewBidRecieved(address player, uint amount);
    event CalculatedNewRandom(uint random);

    function bid() public payable {
        NewBidRecieved(msg.sender, msg.value);

        pot += msg.value;
        insertPlayer(Player(msg.sender, numElements));

        if (players.length >= maxPlayers) {
            uint random = getRandom(maxPlayers);
            CalculatedNewRandom(random);

            winner = players[random];

            pendingWithdrawals[winner.id] += pot;

            clear();
        }
    }

    function getPlayersLength() public view returns(uint length) {
        return numElements;
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

    function getRandom(uint maximum) public view returns (uint random) {
        return uint(block.blockhash(block.number-1))%maximum;
    }

    function insertPlayer(Player newPlayer) internal {
        if (numElements == players.length) {
            players.length += 1;
        }
        players[numElements++] = newPlayer;
    }

    function clear() internal {
        numElements = 0;
        pot = 0;
        players.length = 0;
    }
}
