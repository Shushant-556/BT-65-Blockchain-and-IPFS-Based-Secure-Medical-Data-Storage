// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IConsentManager {
    struct ConsentData {
        address patient;
        address doctor;
        bytes32 recordId;
        uint256 scope;
        uint256 grantedAt;
        uint256 expiresAt;
        bool active;
    }

    event ConsentGranted(
        address indexed patient,
        address indexed doctor,
        bytes32 indexed recordId,
        uint256 scope,
        uint256 expiresAt,
        uint256 timestamp
    );

    event ConsentRevoked(
        address indexed patient,
        address indexed doctor,
        bytes32 indexed recordId,
        uint256 timestamp
    );

    error NotPatient();
    error InvalidDoctor();
    error InvalidScope(uint256 scope);
    error ConsentExpired();
    error ConsentNotFound();
    error ExpirationInPast();
    error ConsentAlreadyActive();

    function grantConsent(
        address patient,
        address doctor,
        bytes32 recordId,
        uint256 scope,
        uint256 expiresAt
    ) external;

    function revokeConsent(address patient, address doctor, bytes32 recordId) external;

    function checkConsent(address patient, address doctor, bytes32 recordId) external view returns (bool);

    function getConsentDetails(
        address patient,
        address doctor,
        bytes32 recordId
    ) external view returns (ConsentData memory);
}
