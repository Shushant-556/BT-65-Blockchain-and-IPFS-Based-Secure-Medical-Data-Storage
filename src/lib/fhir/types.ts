// FHIR R4 Resource Type Definitions for MedChain
// Educational & research prototype mapping based on HL7 FHIR Release 4

export interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  active: boolean;
  name: Array<{
    use?: string;
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  extension?: Array<{
    url: string;
    valueString?: string;
  }>;
}

export interface FHIRPractitioner extends FHIRResource {
  resourceType: 'Practitioner';
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  active: boolean;
  name: Array<{
    family: string;
    given: string[];
    prefix?: string[];
  }>;
  qualification?: Array<{
    code: {
      text: string;
    };
  }>;
}

export interface FHIROrganization extends FHIRResource {
  resourceType: 'Organization';
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  active: boolean;
  name: string;
  address?: Array<{
    line: string[];
    city: string;
    state: string;
  }>;
}

export interface FHIRDocumentReference extends FHIRResource {
  resourceType: 'DocumentReference';
  status: 'current' | 'superseded' | 'entered-in-error';
  docStatus?: 'preliminary' | 'final' | 'amended';
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  subject: {
    reference: string;
    display?: string;
  };
  date: string;
  author?: Array<{
    reference: string;
    display?: string;
  }>;
  description?: string;
  securityLabel?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  content: Array<{
    attachment: {
      contentType: string;
      url?: string;
      size?: number;
      title?: string;
      hash?: string; // Content hash for verification
    };
  }>;
}

export interface FHIRConsent extends FHIRResource {
  resourceType: 'Consent';
  status: 'draft' | 'proposed' | 'active' | 'rejected' | 'inactive' | 'entered-in-error';
  scope: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  patient: {
    reference: string;
    display?: string;
  };
  dateTime: string;
  performer?: Array<{
    reference: string;
    display?: string;
  }>;
  provision?: {
    type: 'deny' | 'permit';
    period?: {
      start: string;
      end: string;
    };
    actor?: Array<{
      role: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      };
      reference: {
        reference: string;
        display?: string;
      };
    }>;
  };
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}
