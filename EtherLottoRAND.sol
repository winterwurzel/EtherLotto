pragma solidity ^0.4.18;


contract EtherLotto {
    uint private pot = 0;
    uint private playerIndex = 0;
    uint private bidSize = 0.2 ether;
    uint private seed = 0;

    // This is the current stage.
    States public state = States.AcceptingHashedSecretBids;
    uint public creationTime = now;

    enum States {
        AcceptingHashedSecretBids,
        RevealSecrets,
        ChooseWinner,
        Finished,
        Reset
    }

    struct Player {
        address id;
        uint index;
        uint secret;
        bytes32 hashedSecret;
    }


    Player[] private players;
    Player private winner;
    mapping (address => uint) private pendingWithdrawals;
    mapping (address => uint) private playerIndizes;

    event NewBidRecieved(address id, uint index, uint amount, uint hashedSecret);
    event SecretRecieved(address id, uint index, uint secret);
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
        if (state == States.AcceptingHashedSecretBids && now >= creationTime + 5 days) // change to a few days
            nextState();
        if (state == States.RevealSecrets && now >= creationTime + 1 days) // change to a few days
            nextState();
        if (state == States.Finished && now >= creationTime + 1 days) // change to a few days
            nextState();
        // The other states transition by transaction
        _;
    }

    // ONLY FOR DEBUGGING
    function setNexState() public {
        nextState();
    }
    // ONLY FOR DEBUGGING
    function getState() public returns(States state) {
        return state;
    }

    function bid(bytes32 _hashedSecret) public payable timedTransitions atState(States.AcceptingHashedSecretBids) {
        // NewBidRecieved(msg.sender, msg.value);
        require(msg.value == bidSize);
        require(_hashedSecret != 0); // check if hashedSecret was sent
        // require(checkSingleBidPerPlayer(msg.sender) == true);

        pot += msg.value;
        insertPlayer(Player(msg.sender, playerIndex, 0, _hashedSecret));
    }

    function calcKeccak(uint number) returns(bytes32 hash) {
        return keccak256(number);
    }

    function reveal(uint _secret) public timedTransitions atState(States.RevealSecrets) {
        require(_secret != 0);

        uint index = playerIndizes[msg.sender] - 1;

        SecretRecieved(msg.sender, index, _secret);

        bytes32 calculatedHash = keccak256(_secret);

        if (calculatedHash == players[index].hashedSecret) {
            players[index].secret = _secret;
            seed += _secret;
        } else {
            pendingWithdrawals[players[index].id] += pot;
        }
    }

    function chooseWinner() public timedTransitions atState(States.ChooseWinner) transitionNext {
        uint winnerSecret = uint(sha256(seed)) % 10 + 1; // random based on seed between 1 & 10

        CalculatedNewRandom(winnerSecret);

        for (uint i = 0; i < playerIndex; i++) {
            if (players[i].secret == winnerSecret) {
                winner = players[i];
                pendingWithdrawals[winner.id] += pot;
                pot = 0;
            }
        }
    }

    function getWinner() public timedTransitions atState(States.Finished) returns(Player winner) {
        return winner;
    }

    function getPlayers() public timedTransitions atState(States.Finished) returns(Player[] players) {
        return players;
    }

    function getPlayersLength() public view returns (uint length) {
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
        playerIndizes[newPlayer.id] = playerIndex;
    }

    function clear() public timedTransitions atState(States.Reset) {
        playerIndex = 0;
        players.length = 0;
        seed = 0;    
        state = States.AcceptingHashedSecretBids;
        creationTime = now;
    }
}
