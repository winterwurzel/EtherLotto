pragma solidity ^0.4.20;


contract EtherLotto {
    address public bank;

    mapping(address => uint) pendingReturns;

    event NewBetRecieved(address player, uint amount);
    event CalculatedNewRandom(uint random);

    // "0xdd870fa1b7c4700f2bd7f44238821c26f7392148"
    function SimpleAuction(address _bank) public {
        bank = _bank;
    }

    function bid() public payable {
        NewBetRecieved(msg.sender, msg.value);

        uint random = uint(sha256(block.timestamp)) % 2;
        CalculatedNewRandom(random);

        uint bet = msg.value;

        if (random == 0) {
            pendingReturns[msg.sender] += bet;
        } else {
            bank.transfer(bet);
        }
    }

    /// Withdraw a bid that was overbid.
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

            if (!msg.sender.send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }
}
