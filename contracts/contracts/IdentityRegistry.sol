// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IIdentityRegistry.sol";

/**
 * @title IdentityRegistry
 * @notice Registers user identities with hashed credentials — NO personal info on-chain.
 * @dev Stores only identity hashes, credential hashes, and public keys.
 */
contract IdentityRegistry is AccessControl, IIdentityRegistry {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => Identity) private _identities;

    uint256 private _totalIdentities;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /// @inheritdoc IIdentityRegistry
    function registerIdentity(
        bytes32 identityHash,
        bytes32 credentialHash,
        bytes calldata publicKey
    ) external {
        if (identityHash == bytes32(0)) revert InvalidIdentityHash();
        if (publicKey.length == 0) revert InvalidPublicKey();
        if (_identities[msg.sender].exists) revert IdentityAlreadyExists(msg.sender);

        _identities[msg.sender] = Identity({
            identityHash: identityHash,
            credentialHash: credentialHash,
            publicKey: publicKey,
            walletAddress: msg.sender,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true
        });

        _totalIdentities++;

        emit IdentityRegistered(msg.sender, identityHash, block.timestamp);
    }

    /// @inheritdoc IIdentityRegistry
    function updateCredential(bytes32 newCredentialHash) external {
        if (!_identities[msg.sender].exists) revert IdentityDoesNotExist(msg.sender);

        _identities[msg.sender].credentialHash = newCredentialHash;
        _identities[msg.sender].updatedAt = block.timestamp;

        emit CredentialUpdated(msg.sender, newCredentialHash, block.timestamp);
    }

    /// @inheritdoc IIdentityRegistry
    function getIdentity(address walletAddress) external view returns (Identity memory) {
        if (!_identities[walletAddress].exists) revert IdentityDoesNotExist(walletAddress);
        return _identities[walletAddress];
    }

    /// @inheritdoc IIdentityRegistry
    function getPublicKey(address walletAddress) external view returns (bytes memory) {
        if (!_identities[walletAddress].exists) revert IdentityDoesNotExist(walletAddress);
        return _identities[walletAddress].publicKey;
    }

    /// @notice Returns total registered identities
    function totalIdentities() external view returns (uint256) {
        return _totalIdentities;
    }
}
