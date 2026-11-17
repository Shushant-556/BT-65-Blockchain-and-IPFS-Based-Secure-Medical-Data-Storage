// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IIdentityRegistry {
    struct Identity {
        bytes32 identityHash;
        bytes32 credentialHash;
        bytes publicKey;
        address walletAddress;
        uint256 registeredAt;
        uint256 updatedAt;
        bool exists;
    }

    event IdentityRegistered(
        address indexed walletAddress,
        bytes32 identityHash,
        uint256 timestamp
    );

    event CredentialUpdated(
        address indexed walletAddress,
        bytes32 newCredentialHash,
        uint256 timestamp
    );

    error IdentityAlreadyExists(address walletAddress);
    error IdentityDoesNotExist(address walletAddress);
    error InvalidIdentityHash();
    error InvalidPublicKey();
    error NotIdentityOwner();

    function registerIdentity(
        bytes32 identityHash,
        bytes32 credentialHash,
        bytes calldata publicKey
    ) external;

    function updateCredential(bytes32 newCredentialHash) external;

    function getIdentity(address walletAddress) external view returns (Identity memory);

    function getPublicKey(address walletAddress) external view returns (bytes memory);
}
