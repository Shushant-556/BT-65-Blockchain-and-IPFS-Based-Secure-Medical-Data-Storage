import { expect } from "chai";
import { ethers } from "hardhat";
import { ConsentManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ConsentManager", function () {
  let consent: ConsentManager;
  let admin: SignerWithAddress;
  let patient: SignerWithAddress;
  let doctor: SignerWithAddress;
  let otherUser: SignerWithAddress;

  const recordId = ethers.id("record-001");
  const SCOPE_SELECTED = 1;
  const SCOPE_CATEGORY = 2;
  const SCOPE_ALL = 3;

  let futureExpiry: number;

  beforeEach(async function () {
    [admin, patient, doctor, otherUser] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ConsentManager");
    consent = await Factory.deploy(admin.address);
    await consent.waitForDeployment();

    const latest = await time.latest();
    futureExpiry = latest + 86400; // 24 hours from now
  });

  describe("Deployment", function () {
    it("should set admin with DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await consent.DEFAULT_ADMIN_ROLE();
      expect(await consent.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should expose scope constants", async function () {
      expect(await consent.SCOPE_SELECTED_RECORDS()).to.equal(1);
      expect(await consent.SCOPE_CATEGORY()).to.equal(2);
      expect(await consent.SCOPE_ALL_CURRENT()).to.equal(3);
    });
  });

  describe("grantConsent", function () {
    it("should grant consent successfully", async function () {
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry);

      const details = await consent.getConsentDetails(patient.address, doctor.address, recordId);
      expect(details.patient).to.equal(patient.address);
      expect(details.doctor).to.equal(doctor.address);
      expect(details.recordId).to.equal(recordId);
      expect(details.scope).to.equal(SCOPE_SELECTED);
      expect(details.active).to.be.true;
    });

    it("should emit ConsentGranted event", async function () {
      await expect(
        consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_CATEGORY, futureExpiry)
      )
        .to.emit(consent, "ConsentGranted")
        .withArgs(patient.address, doctor.address, recordId, SCOPE_CATEGORY, futureExpiry, (v: any) => v > 0);
    });

    it("should revert if caller is not the patient", async function () {
      await expect(
        consent.connect(doctor).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry)
      ).to.be.revertedWithCustomError(consent, "NotPatient");
    });

    it("should revert if doctor is zero address", async function () {
      await expect(
        consent.connect(patient).grantConsent(patient.address, ethers.ZeroAddress, recordId, SCOPE_SELECTED, futureExpiry)
      ).to.be.revertedWithCustomError(consent, "InvalidDoctor");
    });

    it("should revert if doctor is patient", async function () {
      await expect(
        consent.connect(patient).grantConsent(patient.address, patient.address, recordId, SCOPE_SELECTED, futureExpiry)
      ).to.be.revertedWithCustomError(consent, "InvalidDoctor");
    });

    it("should revert for invalid scope (0)", async function () {
      await expect(
        consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, 0, futureExpiry)
      ).to.be.revertedWithCustomError(consent, "InvalidScope");
    });

    it("should revert for invalid scope (4)", async function () {
      await expect(
        consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, 4, futureExpiry)
      ).to.be.revertedWithCustomError(consent, "InvalidScope");
    });

    it("should revert if expiration is in the past", async function () {
      const pastTime = (await time.latest()) - 100;
      await expect(
        consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, pastTime)
      ).to.be.revertedWithCustomError(consent, "ExpirationInPast");
    });

    it("should revert if consent is already active", async function () {
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry);
      await expect(
        consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry)
      ).to.be.revertedWithCustomError(consent, "ConsentAlreadyActive");
    });
  });

  describe("revokeConsent", function () {
    beforeEach(async function () {
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry);
    });

    it("should revoke consent successfully", async function () {
      await consent.connect(patient).revokeConsent(patient.address, doctor.address, recordId);
      expect(await consent.checkConsent(patient.address, doctor.address, recordId)).to.be.false;
    });

    it("should emit ConsentRevoked event", async function () {
      await expect(consent.connect(patient).revokeConsent(patient.address, doctor.address, recordId))
        .to.emit(consent, "ConsentRevoked")
        .withArgs(patient.address, doctor.address, recordId, (v: any) => v > 0);
    });

    it("should revert if caller is not patient", async function () {
      await expect(
        consent.connect(doctor).revokeConsent(patient.address, doctor.address, recordId)
      ).to.be.revertedWithCustomError(consent, "NotPatient");
    });

    it("should revert if consent not found", async function () {
      const fakeRecord = ethers.id("fake");
      await expect(
        consent.connect(patient).revokeConsent(patient.address, doctor.address, fakeRecord)
      ).to.be.revertedWithCustomError(consent, "ConsentNotFound");
    });
  });

  describe("checkConsent", function () {
    it("should return true for active consent", async function () {
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry);
      expect(await consent.checkConsent(patient.address, doctor.address, recordId)).to.be.true;
    });

    it("should return false for expired consent", async function () {
      const shortExpiry = (await time.latest()) + 10;
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, shortExpiry);

      await time.increase(20);
      expect(await consent.checkConsent(patient.address, doctor.address, recordId)).to.be.false;
    });

    it("should return false for non-existent consent", async function () {
      expect(await consent.checkConsent(patient.address, doctor.address, ethers.id("nope"))).to.be.false;
    });

    it("should return false for revoked consent", async function () {
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_SELECTED, futureExpiry);
      await consent.connect(patient).revokeConsent(patient.address, doctor.address, recordId);
      expect(await consent.checkConsent(patient.address, doctor.address, recordId)).to.be.false;
    });
  });

  describe("getConsentDetails", function () {
    it("should return full consent details", async function () {
      await consent.connect(patient).grantConsent(patient.address, doctor.address, recordId, SCOPE_ALL, futureExpiry);
      const details = await consent.getConsentDetails(patient.address, doctor.address, recordId);
      expect(details.scope).to.equal(SCOPE_ALL);
      expect(details.expiresAt).to.equal(futureExpiry);
    });

    it("should revert for never-granted consent", async function () {
      await expect(
        consent.getConsentDetails(patient.address, doctor.address, ethers.id("never"))
      ).to.be.revertedWithCustomError(consent, "ConsentNotFound");
    });
  });
});
