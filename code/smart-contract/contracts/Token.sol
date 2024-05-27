// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
	constructor() ERC20("OPEN", "OPEN") {
		_mint(msg.sender, 10000 * (10 ** uint256(decimals())));
	}
	
	function mint(address to, uint256 amount) public {
		_mint(to, amount);
	}
}
