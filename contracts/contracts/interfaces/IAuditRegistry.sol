// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAuditRegistry {
    enum EventType {
        ACCESS,
        CONSENT_CHANGE,
        VERIFICATION,
        EMERGENCY_ACCESS
    }

    struct AuditEntry {
        bytes32 eventId;
        EventType eventType;
        bytes32 actorHash;
        bytes32 subjectHash;
        bytes32 detailsHash;
        uint256 timestamp;
        bool exists;
    }

    event AuditEventLogged(
        bytes32 indexed eventId,
        EventType indexed eventType,
        bytes32 actorHash,
        bytes32 subjectHash,
        bytes32 detailsHash,
        uint256 timestamp
    );

    error InvalidEventId();
    error EventAlreadyLogged(bytes32 eventId);
    error InvalidActorHash();

    function logEvent(
        bytes32 eventId,
        EventType eventType,
        bytes32 actorHash,
        bytes32 subjectHash,
        bytes32 detailsHash
    ) external;

    function getAuditEntry(bytes32 eventId) external view returns (AuditEntry memory);

    function getAuditCount() external view returns (uint256);
}
