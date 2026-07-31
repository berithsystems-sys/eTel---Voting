export interface CandidateOption {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  photoUrl?: string;
  votesCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  role: 'ORGANIZER' | 'SUPER_ADMIN';
  plan: 'FREE' | 'PREMIUM';
  authProvider: 'email' | 'google';
  electionsCreatedCount: number;
  createdAt: string;
  isLoggedIn?: boolean;
}

export interface AdminTierConfig {
  freeMaxCandidates: number; // default 10
  freeMaxElections: number;  // default 1 (one-time only)
  premiumPrice: number;      // e.g. 29
  currency: string;          // e.g. USD or INR
  pricingPeriod: 'LIFETIME' | 'MONTHLY' | 'PER_ELECTION';
}

export interface PaymentGatewayConfig {
  provider: 'stripe' | 'razorpay' | 'paypal' | 'upi';
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: 'test' | 'live';
  isEnabled: boolean;
  currency: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  provider: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  transactionRef: string;
  timestamp: string;
}

export interface BallotQuestion {
  id: string;
  question: string;
  description: string;
  maxSelections: number;
  minSelections: number;
  options: CandidateOption[];
}

export interface Voter {
  id: string;
  voterId: string;
  voterKey: string;
  name: string;
  email: string;
  weight: number;
  hasVoted: boolean;
  votedAt?: string;
  ipAddress?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  voterId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FLAGGED' | 'BLOCKED';
  notes: string;
}

export interface ElectionSettings {
  // Voters settings
  weightedVoting: boolean;
  ballotReceipt: boolean;
  submitBallotConfirmation: boolean;
  submitBallotConfirmationMessage: string;
  
  // Messages settings
  loginInstructions: string;
  voteConfirmationMessage: string;
  afterElectionMessage: string;
  
  // Email settings & SMTP Provider Configuration
  enableEmail: boolean;
  automaticVoterLogin: boolean;
  emailFromName: string;
  emailSubject: string;
  emailBodyTemplate: string;
  emailReminderSubject: string;
  emailReminderBodyTemplate: string;
  emailProvider?: 'smtp' | 'resend' | 'sendgrid' | 'simulated';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  
  // Results settings
  hideResultsDuringElection: boolean;
  allowDuplicateWriteIn: boolean;
  isResultsPublished: boolean;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  status: 'Draft' | 'Active' | 'Completed';
  startDate: string;
  endDate: string;
  totalVoters?: number;
  timezone: string;
  questions: BallotQuestion[];
  settings: ElectionSettings;
}

export interface VoteSubmission {
  voterId: string;
  voterKey: string;
  selections: { [questionId: string]: string[] }; // questionId -> array of optionIds
}

export interface BallotReceiptData {
  receiptId: string;
  electionTitle: string;
  voterId: string;
  votedAt: string;
  selectionCount: number;
  cryptographicSignature: string;
}
