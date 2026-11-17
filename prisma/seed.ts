import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MedChain database with synthetic educational data...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.accessLog.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.blockchainTransaction.deleteMany();
  await prisma.consentHistory.deleteMany();
  await prisma.consentGrant.deleteMany();
  await prisma.consentRequest.deleteMany();
  await prisma.encryptedKeyEnvelope.deleteMany();
  await prisma.medicalRecordVersion.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.session.deleteMany();
  await prisma.systemHealth.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@123', 10);

  // 1. Create Hospitals
  const hospitalA = await prisma.hospital.create({
    data: {
      name: 'Metro Health Academic Medical Center',
      address: '742 Evergreen Terrace, Medical District',
      city: 'Boston',
      state: 'MA',
      licenseNo: 'HOSP-MA-2024-8841',
      isVerified: true,
    },
  });

  const hospitalB = await prisma.hospital.create({
    data: {
      name: 'St. Jude Community Hospital',
      address: '100 Mercy Way',
      city: 'Cambridge',
      state: 'MA',
      licenseNo: 'HOSP-MA-2023-4192',
      isVerified: true,
    },
  });

  // 2. Create Users & Profiles
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@medchain.demo',
      passwordHash,
      role: 'ADMIN',
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    },
  });

  // Patient 1 (Primary Demo)
  const patient1User = await prisma.user.create({
    data: {
      email: 'patient@medchain.demo',
      passwordHash,
      role: 'PATIENT',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      publicKey: 'BM4xW7y2Lz5kL8w0eX/T79+U12kE45l6dM9nB0oP1qR=',
    },
  });

  const patient1 = await prisma.patientProfile.create({
    data: {
      userId: patient1User.id,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      dateOfBirth: '1988-06-14',
      gender: 'Female',
      bloodGroup: 'O+',
      allergies: JSON.stringify(['Penicillin', 'Sulfa drugs']),
    },
  });

  // Patient 2
  const patient2User = await prisma.user.create({
    data: {
      email: 'patient2@medchain.demo',
      passwordHash,
      role: 'PATIENT',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      publicKey: 'C1aB2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0uV=',
    },
  });

  await prisma.patientProfile.create({
    data: {
      userId: patient2User.id,
      firstName: 'Michael',
      lastName: 'Chen',
      dateOfBirth: '1975-11-23',
      gender: 'Male',
      bloodGroup: 'A-',
      allergies: JSON.stringify(['Peanuts', 'Latex']),
    },
  });

  // Doctor 1 (Primary Demo)
  const doctor1User = await prisma.user.create({
    data: {
      email: 'doctor@medchain.demo',
      passwordHash,
      role: 'DOCTOR',
      walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      publicKey: 'DR1xW7y2Lz5kL8w0eX/T79+U12kE45l6dM9nB0oP1qR=',
    },
  });

  const doctor1 = await prisma.doctorProfile.create({
    data: {
      userId: doctor1User.id,
      firstName: 'Dr. Robert',
      lastName: 'Vance, MD',
      specialization: 'Cardiology & Internal Medicine',
      licenseNumber: 'MD-883921-MA',
      hospitalId: hospitalA.id,
      isVerified: true,
      credentialHash: '0x4f83b2791e847c213d2f9b8761c5e4023a8561d8f7b23c914e637a892b1045e1',
    },
  });

  // Doctor 2
  const doctor2User = await prisma.user.create({
    data: {
      email: 'doctor2@medchain.demo',
      passwordHash,
      role: 'DOCTOR',
      walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
      publicKey: 'DR2xW7y2Lz5kL8w0eX/T79+U12kE45l6dM9nB0oP1qR=',
    },
  });

  const doctor2 = await prisma.doctorProfile.create({
    data: {
      userId: doctor2User.id,
      firstName: 'Dr. Anya',
      lastName: 'Sharma, MD',
      specialization: 'Diagnostic Radiology & Imaging',
      licenseNumber: 'MD-991204-MA',
      hospitalId: hospitalA.id,
      isVerified: true,
      credentialHash: '0x9b1045e14f83b2791e847c213d2f9b8761c5e4023a8561d8f7b23c914e637a89',
    },
  });

  // Hospital User
  const hospitalUser = await prisma.user.create({
    data: {
      email: 'hospital@medchain.demo',
      passwordHash,
      role: 'HOSPITAL',
      walletAddress: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    },
  });

  // 3. Create Synthetic Medical Records for Patient 1
  const record1 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      title: 'Comprehensive Metabolic Panel & Lipid Profile',
      category: 'LAB_REPORT',
      description: 'Routine annual metabolic screening. Normal electrolyte balance, slightly elevated LDL cholesterol.',
      fileName: 'metabolic_panel_2024.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf',
      encryptedCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      contentHash: '0x3a7e58a2d1f9c8b7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
      metadataHash: '0x1c8b7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f33a7e58a2d1f',
      blockchainTxHash: '0x7e8b9c0d1a2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      blockchainRecordId: '0x0000000000000000000000000000000000000000000000000000000000000001',
      isRegistered: true,
      isVerified: true,
      hospitalId: hospitalA.id,
      doctorName: 'Dr. Robert Vance, MD',
      examinationDate: '2024-03-12',
      tags: JSON.stringify(['Metabolic', 'Lipids', 'Annual Screening']),
      version: 1,
    },
  });

  const record2 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      title: 'Contrast-Enhanced Brain MRI & Angiography',
      category: 'IMAGING',
      description: 'Axial, sagittal, and coronal T1/T2 weighted sequences. No intracranial mass, acute infarction, or hemorrhage noted.',
      fileName: 'brain_mri_t1_t2.pdf',
      fileSize: 1468006,
      mimeType: 'application/pdf',
      encryptedCid: 'bafybeicg2u7x2w34fghjk890qwertyuiopasdfghjklzxcvbnm1234567890ab',
      contentHash: '0x8f7b23c914e637a892b1045e14f83b2791e847c213d2f9b8761c5e4023a8561d',
      metadataHash: '0x4e637a892b1045e14f83b2791e847c213d2f9b8761c5e4023a8561d8f7b23c91',
      blockchainTxHash: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b7e8b9c0d1a2f3e4b5c6d7e8f',
      blockchainRecordId: '0x0000000000000000000000000000000000000000000000000000000000000002',
      isRegistered: true,
      isVerified: true,
      hospitalId: hospitalA.id,
      doctorName: 'Dr. Anya Sharma, MD',
      examinationDate: '2024-02-18',
      tags: JSON.stringify(['Radiology', 'MRI', 'Brain', 'Neurology']),
      version: 1,
    },
  });

  const record3 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      title: 'Atorvastatin & Metoprolol Prescription',
      category: 'PRESCRIPTION',
      description: 'Atorvastatin 20mg once daily at bedtime; Metoprolol Succinate 25mg once daily in morning. 90-day supply with 3 refills.',
      fileName: 'cardiology_prescription_rx88.pdf',
      fileSize: 122880,
      mimeType: 'application/pdf',
      encryptedCid: 'bafybeid35u7x2w34fghjk890qwertyuiopasdfghjklzxcvbnm1234567890cd',
      contentHash: '0x2b1045e14f83b2791e847c213d2f9b8761c5e4023a8561d8f7b23c914e637a89',
      metadataHash: '0x7a892b1045e14f83b2791e847c213d2f9b8761c5e4023a8561d8f7b23c914e63',
      blockchainTxHash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b7e8b9c0d1a2f3e4b',
      blockchainRecordId: '0x0000000000000000000000000000000000000000000000000000000000000003',
      isRegistered: true,
      isVerified: true,
      hospitalId: hospitalA.id,
      doctorName: 'Dr. Robert Vance, MD',
      examinationDate: '2024-03-15',
      tags: JSON.stringify(['Prescription', 'Cardiology', 'Statins']),
      version: 1,
    },
  });

  const record4 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      title: 'Inpatient Cardiology Discharge Summary',
      category: 'DISCHARGE',
      description: 'Admission for transient atypical chest pain. Serial troponins negative, stress echocardiogram unremarkable. Discharged stable.',
      fileName: 'discharge_summary_inpatient.pdf',
      fileSize: 312000,
      mimeType: 'application/pdf',
      encryptedCid: 'bafybeie90u7x2w34fghjk890qwertyuiopasdfghjklzxcvbnm1234567890ef',
      contentHash: '0x14f83b2791e847c213d2f9b8761c5e4023a8561d8f7b23c914e637a892b1045e',
      metadataHash: '0x61d8f7b23c914e637a892b1045e14f83b2791e847c213d2f9b8761c5e4023a85',
      blockchainTxHash: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b7e8b9c0d1a2f3e4b5c6d7e8f9a0b1c2d',
      blockchainRecordId: '0x0000000000000000000000000000000000000000000000000000000000000004',
      isRegistered: true,
      isVerified: true,
      hospitalId: hospitalA.id,
      doctorName: 'Dr. Robert Vance, MD',
      examinationDate: '2023-11-05',
      tags: JSON.stringify(['Discharge', 'Cardiology', 'Inpatient']),
      version: 1,
    },
  });

  // 4. Create Key Envelopes (Envelope Encryption for Patient and Authorized Doctor)
  await prisma.encryptedKeyEnvelope.create({
    data: {
      recordId: record1.id,
      userId: patient1User.id,
      encryptedKey: 'ENCRYPTED_DEK_PATIENT1_METABOLIC_KEY_BASE64_SAMPLE==',
      wrappingKeyId: 'PATIENT_KEK_V1',
      algorithm: 'AES-KW',
      version: 1,
    },
  });

  await prisma.encryptedKeyEnvelope.create({
    data: {
      recordId: record1.id,
      userId: doctor1User.id,
      encryptedKey: 'ENCRYPTED_DEK_DOCTOR1_WRAPPED_METABOLIC_KEY_BASE64==',
      wrappingKeyId: 'DR_VANCE_PUBKEY_V1',
      algorithm: 'RSA-OAEP-256',
      version: 1,
    },
  });

  // 5. Create Active Consent Grant (Patient 1 -> Doctor 1)
  const consentGrant1 = await prisma.consentGrant.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      scope: 'ALL_CURRENT',
      grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // in 25 days
      isRevoked: false,
      blockchainTxHash: '0x4d5e6f7a8b7e8b9c0d1a2f3e4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    },
  });

  await prisma.consentHistory.create({
    data: {
      grantId: consentGrant1.id,
      action: 'GRANTED',
      performedBy: patient1User.id,
      details: 'Patient granted full access to current records for ongoing cardiology follow-up',
    },
  });

  // Pending Consent Request from Doctor 2 to Patient 1
  await prisma.consentRequest.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor2.id,
      reason: 'Specialist radiology second opinion regarding previous contrast imaging.',
      scope: 'CATEGORY',
      categories: JSON.stringify(['IMAGING']),
      duration: 168, // 7 days in hours
      status: 'PENDING',
    },
  });

  // 6. Create Audit & Access Logs
  await prisma.accessLog.create({
    data: {
      actorId: doctor1User.id,
      recordId: record1.id,
      action: 'VIEW',
      resource: 'Metabolic Panel Report',
      ipAddress: '192.168.1.45',
      success: true,
      details: 'Decrypted in-memory on doctor client following valid consent verification',
    },
  });

  await prisma.auditEvent.create({
    data: {
      eventType: 'CONSENT_CHANGE',
      actorId: patient1User.id,
      subjectId: doctor1User.id,
      resourceId: consentGrant1.id,
      action: 'CONSENT_GRANTED',
      details: JSON.stringify({ scope: 'ALL_CURRENT', durationDays: 30 }),
      blockchainTxHash: consentGrant1.blockchainTxHash,
      severity: 'INFO',
    },
  });

  await prisma.auditEvent.create({
    data: {
      eventType: 'VERIFICATION',
      actorId: patient1User.id,
      resourceId: record1.id,
      action: 'INTEGRITY_VERIFIED',
      details: JSON.stringify({ computedHash: record1.contentHash, onChainHash: record1.contentHash, status: 'MATCH' }),
      severity: 'INFO',
    },
  });

  // 7. Blockchain Transactions Log
  await prisma.blockchainTransaction.create({
    data: {
      txHash: record1.blockchainTxHash!,
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      functionName: 'registerRecord',
      blockNumber: 1042,
      gasUsed: '84291',
      status: 'CONFIRMED',
      eventType: 'RecordRegistered',
      relatedId: record1.id,
      confirmedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.blockchainTransaction.create({
    data: {
      txHash: consentGrant1.blockchainTxHash!,
      contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      functionName: 'grantConsent',
      blockNumber: 1048,
      gasUsed: '62110',
      status: 'CONFIRMED',
      eventType: 'ConsentGranted',
      relatedId: consentGrant1.id,
      confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 8. Notifications
  await prisma.notification.create({
    data: {
      userId: patient1User.id,
      type: 'ACCESS_REQUEST',
      title: 'New Access Request',
      message: 'Dr. Anya Sharma requested access to your IMAGING medical records.',
      isRead: false,
      relatedId: doctor2.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: patient1User.id,
      type: 'RECORD_UPLOADED',
      title: 'Record Successfully Encrypted & Anchored',
      message: 'Comprehensive Metabolic Panel was encrypted with AES-256-GCM and registered on blockchain.',
      isRead: true,
      relatedId: record1.id,
    },
  });

  // 9. System Health Statuses
  await prisma.systemHealth.createMany({
    data: [
      { service: 'DATABASE', status: 'HEALTHY', latencyMs: 2, details: 'SQLite active (zero daemon overhead)' },
      { service: 'BLOCKCHAIN', status: 'HEALTHY', latencyMs: 14, details: 'Hardhat local EVM node responsive (Block #1052)' },
      { service: 'STORAGE', status: 'HEALTHY', latencyMs: 5, details: 'Encrypted Content-Addressed File Engine online' },
      { service: 'CRYPTO_SUBSYSTEM', status: 'HEALTHY', latencyMs: 1, details: 'WebCrypto AES-256-GCM / Envelope active' },
    ],
  });

  console.log('MedChain synthetic seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
