// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAuditRegistry.sol";

/**
 * @title AuditRegistry
 * @notice Privacy-preserving audit trail using only hashed parameters.
 * @dev All event data is hashed off-chain before submission.
 */
contract AuditRegistry is AccessControl, IAuditRegistry {
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    mapping(bytes32 => AuditEntry) private _entries;
    uint256 private _auditCount;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(AUDITOR_ROLE, admin);
    }

    /// @inheritdoc IAuditRegistry
    function logEvent(
        bytes32 eventId,
        EventType eventType,
        bytes32 actorHash,
        bytes32 subjectHash,
        bytes32 detailsHash
    ) external onlyRole(AUDITOR_ROLE) {
        if (eventId == bytes32(0)) revert InvalidEventId();
        if (actorHash == bytes32(0)) revert InvalidActorHash();
        if (_entries[eventId].exists) revert EventAlreadyLogged(eventId);

        _entries[eventId] = AuditEntry({
            eventId: eventId,
            eventType: eventType,
            actorHash: actorHash,
            subjectHash: subjectHash,
            detailsHash: detailsHash,
            timestamp: block.timestamp,
            exists: true
        });

        _auditCount++;

        emit AuditEventLogged(
            eventId,
            eventType,
            actorHash,
            subjectHash,
            detailsHash,
            block.timestamp
        );
    }

    /// @inheritdoc IAuditRegistry
    function getAuditEntry(bytes32 eventId) external view returns (AuditEntry memory) {
        if (!_entries[eventId].exists) revert InvalidEventId();
        return _entries[eventId];
    }

    /// @inheritdoc IAuditRegistry
    function getAuditCount() external view returns (uint256) {
        return _auditCount;
    }
}
