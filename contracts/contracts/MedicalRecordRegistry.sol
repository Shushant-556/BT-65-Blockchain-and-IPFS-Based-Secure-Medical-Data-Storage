// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IMedicalRecordRegistry.sol";

/**
 * @title MedicalRecordRegistry
 * @notice Stores hashed medical record metadata on-chain. NO plaintext medical data.
 * @dev Uses OpenZeppelin AccessControl for role-based permissions.
 */
contract MedicalRecordRegistry is AccessControl, IMedicalRecordRegistry {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(bytes32 => RecordData) private _records;
    // recordId => version => contentHash
    mapping(bytes32 => mapping(uint256 => bytes32)) private _versionHashes;

    uint256 private _totalRecords;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    /// @inheritdoc IMedicalRecordRegistry
    function registerRecord(
        bytes32 recordId,
        bytes32 contentHash,
        string calldata encryptedCid,
        bytes32 metadataHash
    ) external onlyRole(REGISTRAR_ROLE) {
        if (recordId == bytes32(0)) revert InvalidRecordId();
        if (contentHash == bytes32(0)) revert InvalidContentHash();
        if (_records[recordId].exists) revert RecordAlreadyExists(recordId);

        _records[recordId] = RecordData({
            contentHash: contentHash,
            encryptedCid: encryptedCid,
            metadataHash: metadataHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            currentVersion: 1,
            exists: true
        });

        _versionHashes[recordId][1] = contentHash;
        _totalRecords++;

        emit RecordRegistered(
            recordId,
            contentHash,
            encryptedCid,
            metadataHash,
            msg.sender,
            block.timestamp
        );
    }

    /// @inheritdoc IMedicalRecordRegistry
    function registerVersion(
        bytes32 recordId,
        bytes32 contentHash,
        string calldata encryptedCid,
        uint256 version
    ) external onlyRole(REGISTRAR_ROLE) {
        if (recordId == bytes32(0)) revert InvalidRecordId();
        if (contentHash == bytes32(0)) revert InvalidContentHash();
        if (!_records[recordId].exists) revert RecordDoesNotExist(recordId);

        uint256 expectedVersion = _records[recordId].currentVersion + 1;
        if (version != expectedVersion) revert InvalidVersion(expectedVersion, version);

        _records[recordId].contentHash = contentHash;
        _records[recordId].encryptedCid = encryptedCid;
        _records[recordId].currentVersion = version;

        _versionHashes[recordId][version] = contentHash;

        emit RecordVersionAdded(
            recordId,
            contentHash,
            encryptedCid,
            version,
            msg.sender,
            block.timestamp
        );
    }

    /// @inheritdoc IMedicalRecordRegistry
    function getRecord(bytes32 recordId) external view returns (RecordData memory) {
        if (!_records[recordId].exists) revert RecordDoesNotExist(recordId);
        return _records[recordId];
    }

    /// @inheritdoc IMedicalRecordRegistry
    function verifyRecord(bytes32 recordId, bytes32 contentHash) external view returns (bool) {
        if (!_records[recordId].exists) return false;
        return _records[recordId].contentHash == contentHash;
    }

    /// @notice Returns content hash for a specific version
    function getVersionHash(bytes32 recordId, uint256 version) external view returns (bytes32) {
        if (!_records[recordId].exists) revert RecordDoesNotExist(recordId);
        return _versionHashes[recordId][version];
    }

    /// @notice Returns total number of registered records
    function totalRecords() external view returns (uint256) {
        return _totalRecords;
    }
}
