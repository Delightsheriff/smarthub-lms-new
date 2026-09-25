/**
 * Profile self-edit wire shapes. `AuthUser` itself stays in the auth
 * module — this file holds the patch payloads the profile module owns.
 */

export interface ProfileDetailsPatch {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: "Male" | "Female";
  /** Birthday, day + month. No year is collected. Send both or neither;
   *  the API refuses half a date. */
  birthDay?: number;
  birthMonth?: number;
  phone?: string;
  /** Avatar URL. Empty string clears; the mock "destroys" the old asset. */
  imageUrl?: string;
}

export interface ProfessionalProfilePatch {
  jobTitle?: string;
  department?: string;
  bio?: string;
  altPhone?: string;
  timeZone?: string;
}

export interface BankingDetails {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  payoutEmail?: string;
  updatedAt?: string;
}

export type BankingDetailsPatch = Omit<BankingDetails, "updatedAt">;

export interface AttendancePinRotation {
  rawPin: string;
  issuedAt: string;
}
