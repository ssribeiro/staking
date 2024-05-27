const Staking = artifacts.require("Staking");
const Token = artifacts.require("Token");

const owner = "0x2dBfe02daD89E5e95153925E15862f34921D2ba1";
const vault = "0x2dBfe02daD89E5e95153925E15862f34921D2ba1";
const apy = 10;
const lock = 0;

module.exports = function(deployer) {
    // deployment steps
    deployer.deploy(Token).then(() => {
        return deployer.deploy(Staking, Token.address, owner, vault, apy, lock);
    });
};
