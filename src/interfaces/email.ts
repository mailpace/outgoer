import { AddressObject } from 'mailparser';

export interface EmailMetadata {
  to: AddressObject | AddressObject[];
  from: AddressObject;
  subject: string;
}

export interface EmailJobData {
  raw: string;
  metadata: EmailMetadata;
}
