// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "./OwnNFT1155.sol";

contract ownCollection1155 {
    event Deployed(address owner, address contractAddress);

    function deploy(
        bytes32 _salt,
        string memory name,
        string memory symbol,
        string memory tokenURIPrefix
    ) external returns (address addr) {
        addr = address(
            new CyberpunksNFTUser1155Token{salt: _salt}(name, symbol, tokenURIPrefix)
        );
        CyberpunksNFTUser1155Token token = CyberpunksNFTUser1155Token(address(addr));
        token.transferOwnership(msg.sender);
        emit Deployed(msg.sender, addr);
    }
}
