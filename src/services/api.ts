import { Election, Voter, AuditLog, VoteSubmission, BallotReceiptData, UserProfile, AdminTierConfig, PaymentGatewayConfig, PaymentTransaction } from '../types';

const BASE = '/api';

export async function fetchAuthMe(): Promise<{ user: UserProfile; tierConfig: AdminTierConfig; paymentGateway: Partial<PaymentGatewayConfig> }> {
  const res = await fetch(`${BASE}/auth/me`);
  if (!res.ok) throw new Error('Failed to fetch user auth state');
  return res.json();
}

export async function loginEmail(email: string, password?: string, isSignUp?: boolean, name?: string): Promise<{ success: boolean; user: UserProfile }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, isSignUp, name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Authentication failed');
  return data;
}

export async function loginGoogle(googleEmail: string, googleName: string, googlePhoto?: string): Promise<{ success: boolean; user: UserProfile }> {
  const res = await fetch(`${BASE}/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleEmail, googleName, googlePhoto })
  });
  if (!res.ok) throw new Error('Google Sign-In failed');
  return res.json();
}

export async function logoutUser(): Promise<{ success: boolean; user: UserProfile }> {
  const res = await fetch(`${BASE}/auth/logout`, { method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function switchRole(role?: 'ORGANIZER' | 'SUPER_ADMIN', plan?: 'FREE' | 'PREMIUM'): Promise<{ success: boolean; user: UserProfile }> {
  const res = await fetch(`${BASE}/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, plan })
  });
  if (!res.ok) throw new Error('Failed to switch role');
  return res.json();
}

export async function fetchAdminTierConfig(): Promise<{ tierConfig: AdminTierConfig; paymentGateway: PaymentGatewayConfig; transactions: PaymentTransaction[] }> {
  const res = await fetch(`${BASE}/admin/tier-config`);
  if (!res.ok) throw new Error('Failed to fetch admin config');
  return res.json();
}

export async function updateAdminTierConfig(configPartial: Partial<AdminTierConfig>): Promise<{ success: boolean; tierConfig: AdminTierConfig }> {
  const res = await fetch(`${BASE}/admin/tier-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configPartial)
  });
  if (!res.ok) throw new Error('Failed to update admin tier config');
  return res.json();
}

export async function updateAdminPaymentGateway(settingsPartial: Partial<PaymentGatewayConfig>): Promise<{ success: boolean; paymentGateway: PaymentGatewayConfig }> {
  const res = await fetch(`${BASE}/admin/payment-gateway`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsPartial)
  });
  if (!res.ok) throw new Error('Failed to update payment gateway');
  return res.json();
}

export async function processPaymentCheckout(paymentDetails: { paymentMethod: string; cardLast4?: string; upiId?: string }): Promise<{ success: boolean; message: string; user: UserProfile; transaction: PaymentTransaction }> {
  const res = await fetch(`${BASE}/payment/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentDetails)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment processing failed');
  return data;
}

export async function fetchElection(): Promise<Election> {
  const res = await fetch(`${BASE}/election`);
  if (!res.ok) throw new Error('Failed to fetch election');
  return res.json();
}

export async function updateElection(electionData: Partial<Election>): Promise<{ success: boolean; election: Election }> {
  const res = await fetch(`${BASE}/election`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(electionData)
  });
  if (!res.ok) throw new Error('Failed to update election');
  return res.json();
}

export async function duplicateElection(): Promise<{ success: boolean; election: Election }> {
  const res = await fetch(`${BASE}/election/duplicate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to duplicate election');
  return res.json();
}

export async function fetchVoters(): Promise<Voter[]> {
  const res = await fetch(`${BASE}/voters`);
  if (!res.ok) throw new Error('Failed to fetch voters');
  return res.json();
}

export async function addVoters(voters: Partial<Voter>[]): Promise<{ success: boolean; voters: Voter[] }> {
  const res = await fetch(`${BASE}/voters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(voters)
  });
  if (!res.ok) throw new Error('Failed to add voters');
  return res.json();
}

export async function deleteVoter(id: string): Promise<{ success: boolean; voters: Voter[] }> {
  const res = await fetch(`${BASE}/voters/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete voter');
  return res.json();
}

export async function loginVoter(voterId: string, voterKey: string): Promise<{ success: boolean; voter: Partial<Voter>; loginInstructions?: string }> {
  const res = await fetch(`${BASE}/voter/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voterId, voterKey })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Authentication failed');
  return data;
}

export async function castVote(submission: VoteSubmission): Promise<{ success: boolean; message: string; receipt: BallotReceiptData }> {
  const res = await fetch(`${BASE}/voter/cast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to cast ballot');
  return data;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${BASE}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
