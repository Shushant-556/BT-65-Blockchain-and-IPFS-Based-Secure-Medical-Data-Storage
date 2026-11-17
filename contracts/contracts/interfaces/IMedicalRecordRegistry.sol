// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMedicalRecordRegistry {
    struct RecordData {
        bytes32 contentHash;
        string encryptedCid;
        bytes32 metadataHash;
        address registeredBy;
        uint256 timestamp;
        uint256 currentVersion;
        bool exists;
    }

    event RecordRegistered(
        bytes32 indexed recordId,
        bytes32 contentHash,
        string encryptedCid,
        bytes32 metadataHash,
        address indexed registeredBy,
        uint256 timestamp
    );

    event RecordVersionAdded(
        bytes32 indexed recordId,
        bytes32 contentHash,
        string encryptedCid,
        uint256 version,
        address indexed updatedBy,
        uint256 timestamp
    );

    error RecordAlreadyExists(bytes32 recordId);
    error RecordDoesNotExist(bytes32 recordId);
    error InvalidRecordId();
    error InvalidContentHash();
    error InvalidVersion(uint256 expected, uint256 provided);

    function registerRecord(
        bytes32 recordId,
        bytes32 contentHash,
        string calldata encryptedCid,
        bytes32 metadataHash
    ) external;

    function registerVersion(
        bytes32 recordId,
        bytes32 contentHash,
        string calldata encryptedCid,
        uint256 version
    ) external;

    function getRecord(bytes32 recordId) external view returns (RecordData memory);

    function verifyRecord(bytes32 recordId, bytes32 contentHash) external view returns (bool);
}
