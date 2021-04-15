const YasToken = artifacts.require("YasToken");

module.exports = function (deployer) {
  deployer.deploy(YasToken);
};
