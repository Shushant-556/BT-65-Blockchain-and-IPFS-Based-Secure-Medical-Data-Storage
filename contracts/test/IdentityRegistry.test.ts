import { expect } from "chai";
import { ethers } from "hardhat";
import { IdentityRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("IdentityRegistry", function () {
  let registry: IdentityRegistry;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const identityHash = ethers.id("identity-hash-user1");
  const credentialHash = ethers.id("credential-hash-user1");
  const publicKey = ethers.toUtf8Bytes("ed25519-public-key-placeholder-32bytes!");

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("IdentityRegistry");
    registry = await Factory.deploy(admin.address);
    await registry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set admin with DEFAULT_ADMIN_ROLE", async function () {
      const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
      expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("should start with zero identities", async function () {
      expect(await registry.totalIdentities()).to.equal(0);
    });
  });

  describe("registerIdentity", function () {
    it("should register a new identity", async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);

      const identity = await registry.getIdentity(user1.address);
      expect(identity.identityHash).to.equal(identityHash);
      expect(identity.credentialHash).to.equal(credentialHash);
      expect(identity.walletAddress).to.equal(user1.address);
      expect(identity.exists).to.be.true;
    });

    it("should emit IdentityRegistered event", async function () {
      await expect(registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey))
        .to.emit(registry, "IdentityRegistered")
        .withArgs(user1.address, identityHash, (v: any) => v > 0);
    });

    it("should increment totalIdentities", async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);
      expect(await registry.totalIdentities()).to.equal(1);
    });

    it("should revert for zero identityHash", async function () {
      await expect(
        registry.connect(user1).registerIdentity(ethers.ZeroHash, credentialHash, publicKey)
      ).to.be.revertedWithCustomError(registry, "InvalidIdentityHash");
    });

    it("should revert for empty publicKey", async function () {
      await expect(
        registry.connect(user1).registerIdentity(identityHash, credentialHash, "0x")
      ).to.be.revertedWithCustomError(registry, "InvalidPublicKey");
    });

    it("should revert if identity already exists", async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);
      await expect(
        registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey)
      ).to.be.revertedWithCustomError(registry, "IdentityAlreadyExists");
    });

    it("should allow different users to register separately", async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);
      const id2 = ethers.id("identity-user2");
      const cred2 = ethers.id("cred-user2");
      await registry.connect(user2).registerIdentity(id2, cred2, publicKey);
      expect(await registry.totalIdentities()).to.equal(2);
    });
  });

  describe("updateCredential", function () {
    beforeEach(async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);
    });

    it("should update credential hash", async function () {
      const newCred = ethers.id("new-credential");
      await registry.connect(user1).updateCredential(newCred);

      const identity = await registry.getIdentity(user1.address);
      expect(identity.credentialHash).to.equal(newCred);
    });

    it("should emit CredentialUpdated event", async function () {
      const newCred = ethers.id("new-credential");
      await expect(registry.connect(user1).updateCredential(newCred))
        .to.emit(registry, "CredentialUpdated")
        .withArgs(user1.address, newCred, (v: any) => v > 0);
    });

    it("should revert if identity does not exist", async function () {
      await expect(
        registry.connect(user2).updateCredential(ethers.id("nope"))
      ).to.be.revertedWithCustomError(registry, "IdentityDoesNotExist");
    });

    it("should update the updatedAt timestamp", async function () {
      const before = await registry.getIdentity(user1.address);
      // Small delay handled by block mining
      await registry.connect(user1).updateCredential(ethers.id("updated"));
      const after = await registry.getIdentity(user1.address);
      expect(after.updatedAt).to.be.gte(before.updatedAt);
    });
  });

  describe("getIdentity", function () {
    it("should revert for non-existent identity", async function () {
      await expect(
        registry.getIdentity(user1.address)
      ).to.be.revertedWithCustomError(registry, "IdentityDoesNotExist");
    });

    it("should return full identity data", async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);
      const identity = await registry.getIdentity(user1.address);
      expect(identity.walletAddress).to.equal(user1.address);
      expect(identity.registeredAt).to.be.gt(0);
    });
  });

  describe("getPublicKey", function () {
    it("should return public key", async function () {
      await registry.connect(user1).registerIdentity(identityHash, credentialHash, publicKey);
      const key = await registry.getPublicKey(user1.address);
      expect(ethers.toUtf8String(key)).to.equal("ed25519-public-key-placeholder-32bytes!");
    });

    it("should revert for non-existent identity", async function () {
      await expect(
        registry.getPublicKey(user2.address)
      ).to.be.revertedWithCustomError(registry, "IdentityDoesNotExist");
    });
  });
});
