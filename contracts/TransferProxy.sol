// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interface/ITransferProxy.sol";

contract TransferProxy is AccessControl, ITransferProxy {
    event operatorChanged(address indexed from, address indexed to);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    address public owner;
    address public operator;
    // Create a new role identifier for the minter role
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // Create a new role identifier for the minter role
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor() {
        owner = msg.sender;
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, operator);
    }

    function changeOperator(address _operator)
        external
        onlyRole(ADMIN_ROLE)
        returns (bool)
    {
        require(
            _operator != address(0),
            "Operator: new operator is the zero address"
        );
        _revokeRole(ADMIN_ROLE, operator);
        operator = _operator;
        _grantRole(OPERATOR_ROLE, operator);
        emit operatorChanged(address(0), operator);
        return true;
    }

    /** change the Ownership from current owner to newOwner address
        @param newOwner : newOwner address */

    function transferOwnership(address newOwner)
        external
        onlyRole(ADMIN_ROLE)
        returns (bool)
    {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _revokeRole(ADMIN_ROLE, owner);
        owner = newOwner;
        _grantRole(ADMIN_ROLE, newOwner);
        emit OwnershipTransferred(owner, newOwner);
        return true;
    }

    function erc721safeTransferFrom(
        IERC721 token,
        address from,
        address to,
        uint256 tokenId
    ) external override onlyRole(OPERATOR_ROLE) {
        token.safeTransferFrom(from, to, tokenId);
    }

    function erc1155safeTransferFrom(
        IERC1155 token,
        address from,
        address to,
        uint256 tokenId,
        uint256 value,
        bytes calldata data
    ) external override onlyRole(OPERATOR_ROLE) {
        token.safeTransferFrom(from, to, tokenId, value, data);
    }

    function erc20safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) external override onlyRole(OPERATOR_ROLE) {
        require(
            token.transferFrom(from, to, value),
            "failure while transferring"
        );
    }
}