// MedChain FHIR R4 Mapper
// Bi-directional translation between MedChain DB models and FHIR resources

import {
  FHIRPatient,
  FHIRPractitioner,
  FHIROrganization,
  FHIRDocumentReference,
  FHIRConsent,
} from './types';

export function patientToFHIR(patient: any): FHIRPatient {
  return {
    resourceType: 'Patient',
    id: patient.id,
    active: true,
    identifier: [
      {
        system: 'https://medchain.network/identifiers/patients',
        value: patient.id,
      },
    ],
    name: [
      {
        use: 'official',
        family: patient.lastName,
        given: [patient.firstName],
      },
    ],
    gender: (patient.gender?.toLowerCase() as any) || 'unknown',
    birthDate: patient.dateOfBirth,
    extension: patient.bloodGroup
      ? [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/patient-bloodGroup',
            valueString: patient.bloodGroup,
          },
        ]
      : undefined,
  };
}

export function doctorToFHIR(doctor: any): FHIRPractitioner {
  return {
    resourceType: 'Practitioner',
    id: doctor.id,
    active: doctor.isVerified ?? true,
    identifier: [
      {
        system: 'https://medchain.network/identifiers/license',
        value: doctor.licenseNumber,
      },
    ],
    name: [
      {
        family: doctor.lastName,
        given: [doctor.firstName],
        prefix: ['Dr.'],
      },
    ],
    qualification: [
      {
        code: {
          text: doctor.specialization,
        },
      },
    ],
  };
}

export function hospitalToFHIR(hospital: any): FHIROrganization {
  return {
    resourceType: 'Organization',
    id: hospital.id,
    active: hospital.isVerified ?? true,
    identifier: [
      {
        system: 'https://medchain.network/identifiers/hospitals',
        value: hospital.licenseNo,
      },
    ],
    name: hospital.name,
    address: [
      {
        line: [hospital.address],
        city: hospital.city,
        state: hospital.state,
      },
    ],
  };
}

export function medicalRecordToFHIR(
  record: any,
  patientName?: string
): FHIRDocumentReference {
  const categoryCodeMap: Record<string, { code: string; display: string }> = {
    LAB_REPORT: { code: '11502-2', display: 'Laboratory report' },
    PRESCRIPTION: { code: '57833-6', display: 'Prescription for medication' },
    IMAGING: { code: '18748-4', display: 'Diagnostic imaging report' },
    DISCHARGE: { code: '18842-5', display: 'Discharge summary' },
    CLINICAL_NOTE: { code: '34117-2', display: 'Provider-unspecified clinical notes' },
    VACCINATION: { code: '87273-9', display: 'Immunization summary report' },
    HISTORY: { code: '34109-9', display: 'Evaluation and management note' },
    OTHER: { code: '51851-4', display: 'Administrative document' },
  };

  const cat = categoryCodeMap[record.category] || categoryCodeMap.OTHER;

  return {
    resourceType: 'DocumentReference',
    id: record.id,
    status: 'current',
    docStatus: 'final',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: cat.code,
          display: cat.display,
        },
      ],
      text: record.title,
    },
    category: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
            code: 'clinical-note',
            display: record.category,
          },
        ],
      },
    ],
    subject: {
      reference: `Patient/${record.patientId}`,
      display: patientName || 'Patient',
    },
    date: record.createdAt?.toISOString ? record.createdAt.toISOString() : new Date().toISOString(),
    description: record.description || record.title,
    securityLabel: [
      {
        coding: [
          {
            system: 'https://medchain.network/security',
            code: 'AES-256-GCM',
            display: 'Client-side Encrypted Document',
          },
        ],
      },
    ],
    content: [
      {
        attachment: {
          contentType: record.mimeType,
          url: record.encryptedCid ? `ipfs://${record.encryptedCid}` : undefined,
          size: record.fileSize,
          title: record.fileName,
          hash: record.contentHash,
        },
      },
    ],
  };
}

export function consentGrantToFHIR(grant: any): FHIRConsent {
  return {
    resourceType: 'Consent',
    id: grant.id,
    status: grant.isRevoked ? 'inactive' : 'active',
    scope: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'patient-privacy',
          display: 'Privacy Consent',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'INFA',
            display: 'Information Access',
          },
        ],
      },
    ],
    patient: {
      reference: `Patient/${grant.patientId}`,
    },
    dateTime: grant.grantedAt?.toISOString ? grant.grantedAt.toISOString() : new Date().toISOString(),
    provision: {
      type: grant.isRevoked ? 'deny' : 'permit',
      period: {
        start: grant.grantedAt?.toISOString ? grant.grantedAt.toISOString() : new Date().toISOString(),
        end: grant.expiresAt?.toISOString ? grant.expiresAt.toISOString() : new Date().toISOString(),
      },
      actor: [
        {
          role: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'PRCP',
                display: 'Primary Recipient',
              },
            ],
          },
          reference: {
            reference: `Practitioner/${grant.doctorId}`,
          },
        },
      ],
    },
  };
}
