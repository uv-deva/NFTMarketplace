// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;


import "./OwnNFT721.sol";

contract ownCollection721 {
    event Deployed(address owner, address contractAddress);

    function deploy(
        bytes32 _salt,
        string memory name,
        string memory symbol,
        string memory tokenURIPrefix
    ) external returns (address addr) {
        addr = address(
            new CyberpunksNFTUser721Token{salt: _salt}(name, symbol, tokenURIPrefix)
        );
        CyberpunksNFTUser721Token token = CyberpunksNFTUser721Token(address(addr));
        token.transferOwnership(msg.sender);
        emit Deployed(msg.sender, addr);
    }
}
