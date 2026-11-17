// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IConsentManager.sol";

/**
 * @title ConsentManager
 * @notice Manages patient consent for sharing medical records with doctors.
 * @dev Only the patient (msg.sender == patient) can grant consent.
 */
contract ConsentManager is AccessControl, IConsentManager {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public constant SCOPE_SELECTED_RECORDS = 1;
    uint256 public constant SCOPE_CATEGORY = 2;
    uint256 public constant SCOPE_ALL_CURRENT = 3;

    // patient => doctor => recordId => ConsentData
    mapping(address => mapping(address => mapping(bytes32 => ConsentData))) private _consents;

    uint256 private _totalConsents;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /// @inheritdoc IConsentManager
    function grantConsent(
        address patient,
        address doctor,
        bytes32 recordId,
        uint256 scope,
        uint256 expiresAt
    ) external {
        if (msg.sender != patient) revert NotPatient();
        if (doctor == address(0) || doctor == patient) revert InvalidDoctor();
        if (scope < SCOPE_SELECTED_RECORDS || scope > SCOPE_ALL_CURRENT) revert InvalidScope(scope);
        if (expiresAt <= block.timestamp) revert ExpirationInPast();

        ConsentData storage consent = _consents[patient][doctor][recordId];
        if (consent.active) revert ConsentAlreadyActive();

        _consents[patient][doctor][recordId] = ConsentData({
            patient: patient,
            doctor: doctor,
            recordId: recordId,
            scope: scope,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            active: true
        });

        _totalConsents++;

        emit ConsentGranted(patient, doctor, recordId, scope, expiresAt, block.timestamp);
    }

    /// @inheritdoc IConsentManager
    function revokeConsent(address patient, address doctor, bytes32 recordId) external {
        if (msg.sender != patient) revert NotPatient();

        ConsentData storage consent = _consents[patient][doctor][recordId];
        if (!consent.active) revert ConsentNotFound();

        consent.active = false;

        emit ConsentRevoked(patient, doctor, recordId, block.timestamp);
    }

    /// @inheritdoc IConsentManager
    function checkConsent(
        address patient,
        address doctor,
        bytes32 recordId
    ) external view returns (bool) {
        ConsentData storage consent = _consents[patient][doctor][recordId];
        if (!consent.active) return false;
        if (block.timestamp >= consent.expiresAt) return false;
        return true;
    }

    /// @inheritdoc IConsentManager
    function getConsentDetails(
        address patient,
        address doctor,
        bytes32 recordId
    ) external view returns (ConsentData memory) {
        ConsentData storage consent = _consents[patient][doctor][recordId];
        if (!consent.active && consent.grantedAt == 0) revert ConsentNotFound();
        return consent;
    }

    /// @notice Returns total number of consents ever granted
    function totalConsents() external view returns (uint256) {
        return _totalConsents;
    }
}
