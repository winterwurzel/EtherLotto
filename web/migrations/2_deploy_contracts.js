var EtherLotto = artifacts.require("./EtherLotto.sol");

module.exports = function(deployer) {
  deployer.deploy(EtherLotto);
};
