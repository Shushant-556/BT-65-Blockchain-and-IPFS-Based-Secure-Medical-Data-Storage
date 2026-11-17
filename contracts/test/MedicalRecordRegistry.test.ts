import { expect } from "chai";
import { ethers } from "hardhat";
import { MedicalRecordRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MedicalRecordRegistry", function () {
  let registry: MedicalRecordRegistry;
  let admin: SignerWithAddress;
  let registrar: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const recordId = ethers.id("record-001");
  const contentHash = ethers.id("content-hash-001");
  const metadataHash = ethers.id("metadata-hash-001");
  const encryptedCid = "encrypted:QmXyz123abc";

  beforeEach(async function () {
    [admin, registrar, unauthorized] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MedicalRecordRegistry");
    registry = await Factory.deploy(admin.address);
    await registry.waitForDeployment();

    // Grant registrar role
    const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
    await registry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
  });

  describe("Deployment", function () {
    it("should set admin with DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
      expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should set admin with REGISTRAR_ROLE", async function () {
      const REGISTRAR_ROLE = await registry.REGISTRAR_ROLE();
      expect(await registry.hasRole(REGISTRAR_ROLE, admin.address)).to.be.true;
    });

    it("should start with zero total records", async function () {
      expect(await registry.totalRecords()).to.equal(0);
    });
  });

  describe("registerRecord", function () {
    it("should register a new record", async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);

      const record = await registry.getRecord(recordId);
      expect(record.contentHash).to.equal(contentHash);
      expect(record.encryptedCid).to.equal(encryptedCid);
      expect(record.metadataHash).to.equal(metadataHash);
      expect(record.registeredBy).to.equal(registrar.address);
      expect(record.currentVersion).to.equal(1);
      expect(record.exists).to.be.true;
    });

    it("should emit RecordRegistered event", async function () {
      await expect(registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash))
        .to.emit(registry, "RecordRegistered")
        .withArgs(recordId, contentHash, encryptedCid, metadataHash, registrar.address, (v: any) => v > 0);
    });

    it("should increment totalRecords", async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);
      expect(await registry.totalRecords()).to.equal(1);
    });

    it("should revert if recordId is zero", async function () {
      await expect(
        registry.connect(registrar).registerRecord(ethers.ZeroHash, contentHash, encryptedCid, metadataHash)
      ).to.be.revertedWithCustomError(registry, "InvalidRecordId");
    });

    it("should revert if contentHash is zero", async function () {
      await expect(
        registry.connect(registrar).registerRecord(recordId, ethers.ZeroHash, encryptedCid, metadataHash)
      ).to.be.revertedWithCustomError(registry, "InvalidContentHash");
    });

    it("should revert if record already exists", async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);
      await expect(
        registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash)
      ).to.be.revertedWithCustomError(registry, "RecordAlreadyExists");
    });

    it("should revert if caller lacks REGISTRAR_ROLE", async function () {
      await expect(
        registry.connect(unauthorized).registerRecord(recordId, contentHash, encryptedCid, metadataHash)
      ).to.be.reverted;
    });
  });

  describe("registerVersion", function () {
    beforeEach(async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);
    });

    it("should register a new version", async function () {
      const newHash = ethers.id("content-v2");
      await registry.connect(registrar).registerVersion(recordId, newHash, "encrypted:QmNewCid", 2);

      const record = await registry.getRecord(recordId);
      expect(record.contentHash).to.equal(newHash);
      expect(record.currentVersion).to.equal(2);
    });

    it("should emit RecordVersionAdded event", async function () {
      const newHash = ethers.id("content-v2");
      await expect(registry.connect(registrar).registerVersion(recordId, newHash, "encrypted:QmV2", 2))
        .to.emit(registry, "RecordVersionAdded")
        .withArgs(recordId, newHash, "encrypted:QmV2", 2, registrar.address, (v: any) => v > 0);
    });

    it("should revert for non-existent record", async function () {
      const fakeId = ethers.id("nonexistent");
      await expect(
        registry.connect(registrar).registerVersion(fakeId, contentHash, encryptedCid, 2)
      ).to.be.revertedWithCustomError(registry, "RecordDoesNotExist");
    });

    it("should revert for wrong version number", async function () {
      const newHash = ethers.id("content-v3");
      await expect(
        registry.connect(registrar).registerVersion(recordId, newHash, "encrypted:QmV3", 5)
      ).to.be.revertedWithCustomError(registry, "InvalidVersion");
    });
  });

  describe("verifyRecord", function () {
    it("should return true for matching hash", async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);
      expect(await registry.verifyRecord(recordId, contentHash)).to.be.true;
    });

    it("should return false for non-matching hash", async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);
      expect(await registry.verifyRecord(recordId, ethers.id("wrong"))).to.be.false;
    });

    it("should return false for non-existent record", async function () {
      expect(await registry.verifyRecord(ethers.id("nope"), contentHash)).to.be.false;
    });
  });

  describe("getVersionHash", function () {
    it("should return hash for specific version", async function () {
      await registry.connect(registrar).registerRecord(recordId, contentHash, encryptedCid, metadataHash);
      expect(await registry.getVersionHash(recordId, 1)).to.equal(contentHash);

      const v2Hash = ethers.id("v2");
      await registry.connect(registrar).registerVersion(recordId, v2Hash, "cid-v2", 2);
      expect(await registry.getVersionHash(recordId, 2)).to.equal(v2Hash);
    });
  });
});
