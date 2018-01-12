pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/EtherLotto.sol";


contract TestEtherLotto {
    // Truffle will send the TestContract one Ether after deploying the contract.
    uint public initialBalance = 1 ether;

    function testInitialPotBalance() public {
        EtherLotto etherLotto = EtherLotto(DeployedAddresses.EtherLotto());

        uint expextedPot = 0;

        Assert.equal(etherLotto.getPotBalance(), expextedPot, "Initial Pot Balance should always be 0");
    }
}
