// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract mockToken is ERC20, Ownable {
    constructor(address accountHolder,string memory name,string memory symbol )Ownable(msg.sender) ERC20( name, symbol) {
        _mint(accountHolder, 1000000 * 10 ** decimals());
    }
}
