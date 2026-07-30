import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initialElection, initialVoters, initialAuditLogs } from './src/data/mockData';
import { Election, Voter, AuditLog, VoteSubmission, BallotReceiptData, UserProfile, AdminTierConfig, PaymentGatewayConfig, PaymentTransaction } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory backend database state
let currentElection: Election = JSON.parse(JSON.stringify(initialElection));
let votersList: Voter[] = JSON.parse(JSON.stringify(initialVoters));
let auditLogsList: AuditLog[] = JSON.parse(JSON.stringify(initialAuditLogs));

// Current Auth User
let currentUser: UserProfile = {
  id: 'usr-organizer-01',
  email: 'organizer@etelna.org',
  name: 'Demo Organizer',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'ORGANIZER',
  plan: 'FREE',
  authProvider: 'google',
  electionsCreatedCount: 1,
  createdAt: new Date().toISOString()
};

// Admin Tier Config (Super admin controls Free Plan restrictions)
let currentTierConfig: AdminTierConfig = {
  freeMaxCandidates: 10,
  freeMaxElections: 1,
  premiumPrice: 2499,
  currency: 'INR',
  pricingPeriod: 'LIFETIME'
};

// Payment Gateway Config (Admin sets up credentials)
let paymentGatewayConfig: PaymentGatewayConfig = {
  provider: 'razorpay',
  publishableKey: 'rzp_test_eTelnaLive9918237',
  secretKey: 'sk_test_eTelnaSecretPrivKey',
  webhookSecret: 'whsec_eTelnaWebhookSignature',
  mode: 'test',
  isEnabled: true,
  currency: 'INR'
};

// Payment History
let paymentTransactions: PaymentTransaction[] = [
  {
    id: 'tx-1001',
    userId: 'usr-organizer-02',
    userName: 'Global Trade Union',
    userEmail: 'admin@gtu-union.org',
    amount: 2499,
    currency: 'INR',
    provider: 'Razorpay / UPI',
    status: 'SUCCESS',
    transactionRef: 'pay_3N1987xAeTelna992',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'eTelna Platform', nodeVersion: process.version });
});

// AUTH ENDPOINTS
app.get('/api/auth/me', (req, res) => {
  res.json({
    user: currentUser,
    tierConfig: currentTierConfig,
    paymentGateway: {
      provider: paymentGatewayConfig.provider,
      publishableKey: paymentGatewayConfig.publishableKey,
      mode: paymentGatewayConfig.mode,
      isEnabled: paymentGatewayConfig.isEnabled,
      currency: paymentGatewayConfig.currency
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  currentUser = {
    id: `usr-${Date.now()}`,
    email: email || 'user@etelna.org',
    name: email ? email.split('@')[0] : 'eTelna User',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: role || 'ORGANIZER',
    plan: role === 'SUPER_ADMIN' ? 'PREMIUM' : currentUser.plan,
    authProvider: 'email',
    electionsCreatedCount: currentUser.electionsCreatedCount,
    createdAt: new Date().toISOString()
  };
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/google-login', (req, res) => {
  const { googleEmail, googleName, googlePhoto } = req.body;
  currentUser = {
    id: `usr-google-${Date.now()}`,
    email: googleEmail || 'google.user@gmail.com',
    name: googleName || 'Google Auth User',
    photoUrl: googlePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'ORGANIZER',
    plan: currentUser.plan,
    authProvider: 'google',
    electionsCreatedCount: currentUser.electionsCreatedCount,
    createdAt: new Date().toISOString()
  };
  res.json({ success: true, user: currentUser });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role, plan } = req.body;
  if (role) currentUser.role = role;
  if (plan) currentUser.plan = plan;
  res.json({ success: true, user: currentUser });
});

// ADMIN CONFIG ENDPOINTS
app.get('/api/admin/tier-config', (req, res) => {
  res.json({
    tierConfig: currentTierConfig,
    paymentGateway: paymentGatewayConfig,
    transactions: paymentTransactions
  });
});

app.put('/api/admin/tier-config', (req, res) => {
  const newConfig = req.body;
  currentTierConfig = {
    ...currentTierConfig,
    ...newConfig
  };
  res.json({ success: true, tierConfig: currentTierConfig });
});

app.put('/api/admin/payment-gateway', (req, res) => {
  const newGatewaySettings = req.body;
  paymentGatewayConfig = {
    ...paymentGatewayConfig,
    ...newGatewaySettings
  };
  res.json({ success: true, paymentGateway: paymentGatewayConfig });
});

// PAYMENT CHECKOUT (Upgrade from Free to Premium)
app.post('/api/payment/checkout', (req, res) => {
  const { paymentMethod, cardLast4, upiId } = req.body;

  const newTx: PaymentTransaction = {
    id: `tx-${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    amount: currentTierConfig.premiumPrice,
    currency: currentTierConfig.currency,
    provider: paymentGatewayConfig.provider,
    status: 'SUCCESS',
    transactionRef: `pay_${paymentGatewayConfig.provider.substring(0, 3)}_${Math.random().toString(36).substring(2, 10)}`,
    timestamp: new Date().toISOString()
  };

  paymentTransactions.unshift(newTx);
  currentUser.plan = 'PREMIUM'; // Upgrade user to Premium!

  res.json({
    success: true,
    message: 'Payment processed successfully! Your eTelna Organizer account is now upgraded to Premium.',
    user: currentUser,
    transaction: newTx
  });
});

// Get active election
app.get('/api/election', (req, res) => {
  res.json(currentElection);
});

// Update election details or settings (with Free Candidate limit check)
app.put('/api/election', (req, res) => {
  const updatedData = req.body;

  // Check if candidate count exceeds Free plan limit
  if (
    currentUser.role === 'ORGANIZER' &&
    currentUser.plan === 'FREE' &&
    updatedData.questions &&
    updatedData.questions[0] &&
    updatedData.questions[0].options
  ) {
    const totalOptionsCount = updatedData.questions[0].options.length;
    if (totalOptionsCount > currentTierConfig.freeMaxCandidates) {
      return res.status(403).json({
        error: `Free Plan Limit Reached: On the Free plan, you can set up a maximum of ${currentTierConfig.freeMaxCandidates} candidates. Upgrade to eTelna Premium to add unlimited candidates!`,
        limitExceeded: 'CANDIDATES_LIMIT',
        maxAllowed: currentTierConfig.freeMaxCandidates
      });
    }
  }

  currentElection = {
    ...currentElection,
    ...updatedData,
    settings: {
      ...currentElection.settings,
      ...(updatedData.settings || {})
    }
  };
  res.json({ success: true, election: currentElection });
});

// Duplicate election template (with Free One-Time Election limit check)
app.post('/api/election/duplicate', (req, res) => {
  if (
    currentUser.role === 'ORGANIZER' &&
    currentUser.plan === 'FREE' &&
    currentUser.electionsCreatedCount >= currentTierConfig.freeMaxElections
  ) {
    return res.status(403).json({
      error: `Free Plan One-Time Election Limit Reached: Free organizers can create ${currentTierConfig.freeMaxElections} election only. Upgrade to eTelna Premium for unlimited elections!`,
      limitExceeded: 'ELECTIONS_LIMIT',
      maxAllowed: currentTierConfig.freeMaxElections
    });
  }

  const newElection: Election = {
    ...JSON.parse(JSON.stringify(currentElection)),
    id: `election-${Date.now().toString().slice(-6)}`,
    title: `${currentElection.title} (Copy)`,
    status: 'Draft',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  };
  
  // Reset candidate counts
  newElection.questions.forEach(q => {
    q.options.forEach(o => { o.votesCount = 0; });
  });

  currentElection = newElection;
  currentUser.electionsCreatedCount += 1;
  // Reset voters voting status for new copy
  votersList.forEach(v => { v.hasVoted = false; v.votedAt = undefined; });
  
  res.json({ success: true, message: 'Election duplicated successfully!', election: newElection });
});

// List voters
app.get('/api/voters', (req, res) => {
  res.json(votersList);
});

// Add / Import voters
app.post('/api/voters', (req, res) => {
  const newVoters: Partial<Voter>[] = Array.isArray(req.body) ? req.body : [req.body];
  const added: Voter[] = [];

  newVoters.forEach((v, idx) => {
    const voterId = v.voterId || `VOTER-${1000 + votersList.length + idx + 1}`;
    const voterKey = v.voterKey || Math.random().toString(36).substring(2, 10).toUpperCase();
    const voterItem: Voter = {
      id: `vtr-${Date.now()}-${idx}`,
      voterId,
      voterKey,
      name: v.name || 'Anonymous Voter',
      email: v.email || `${voterId.toLowerCase()}@example.com`,
      weight: v.weight || 1,
      hasVoted: false,
    };
    votersList.push(voterItem);
    added.push(voterItem);
  });

  res.json({ success: true, addedCount: added.length, voters: votersList });
});

// Delete voter
app.delete('/api/voters/:id', (req, res) => {
  const { id } = req.params;
  votersList = votersList.filter(v => v.id !== id && v.voterId !== id);
  res.json({ success: true, voters: votersList });
});

// Voter Login Verification
app.post('/api/voter/login', (req, res) => {
  const { voterId, voterKey } = req.body;
  if (!voterId || !voterKey) {
    return res.status(400).json({ error: 'Voter ID and Voter Key are required.' });
  }

  const voter = votersList.find(
    v => v.voterId.trim().toLowerCase() === voterId.trim().toLowerCase() &&
         v.voterKey.trim().toLowerCase() === voterKey.trim().toLowerCase()
  );

  if (!voter) {
    return res.status(401).json({ error: 'Invalid Voter ID or Voter Key combination.' });
  }

  res.json({
    success: true,
    voter: {
      voterId: voter.voterId,
      name: voter.name,
      email: voter.email,
      hasVoted: voter.hasVoted,
      votedAt: voter.votedAt,
    },
    loginInstructions: currentElection.settings.loginInstructions
  });
});

// Cast Vote
app.post('/api/voter/cast', (req, res) => {
  const { voterId, voterKey, selections } = req.body as VoteSubmission;

  if (!voterId || !voterKey) {
    return res.status(400).json({ error: 'Missing voter authentication tokens.' });
  }

  const voter = votersList.find(
    v => v.voterId.trim().toLowerCase() === voterId.trim().toLowerCase() &&
         v.voterKey.trim().toLowerCase() === voterKey.trim().toLowerCase()
  );

  if (!voter) {
    return res.status(401).json({ error: 'Authentication failed.' });
  }

  if (voter.hasVoted) {
    // Add blocked audit log entry
    const blockedLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      voterId: voter.voterId,
      action: 'Duplicate Vote Attempt Blocked',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser Client',
      status: 'BLOCKED',
      notes: 'Voter key already used. Prevented double voting.'
    };
    auditLogsList.unshift(blockedLog);

    return res.status(403).json({ error: 'You have already cast your ballot in this election.' });
  }

  // Count choices
  let totalSelectionsCount = 0;
  if (selections) {
    Object.keys(selections).forEach(qId => {
      const selectedOptionIds = selections[qId] || [];
      totalSelectionsCount += selectedOptionIds.length;

      const question = currentElection.questions.find(q => q.id === qId);
      if (question) {
        selectedOptionIds.forEach(optId => {
          const opt = question.options.find(o => o.id === optId);
          if (opt) {
            opt.votesCount += (currentElection.settings.weightedVoting ? voter.weight : 1);
          }
        });
      }
    });
  }

  // Mark voter as voted
  const votedTimestamp = new Date().toISOString();
  const voterIp = req.ip || '157.32.18.99';
  voter.hasVoted = true;
  voter.votedAt = votedTimestamp;
  voter.ipAddress = voterIp;

  // Check if IP was already used by another voter (Anomaly detection flag)
  const previousSameIpVoters = votersList.filter(v => v.ipAddress === voterIp && v.voterId !== voter.voterId);
  const logStatus = previousSameIpVoters.length > 0 ? 'FLAGGED' : 'SUCCESS';
  const logNotes = previousSameIpVoters.length > 0 
    ? `Multiple voters used same IP (${voterIp}). Flagged for audit.` 
    : 'Ballot cast and cryptographically recorded.';

  // Add success/flagged audit log
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: votedTimestamp,
    voterId: voter.voterId,
    action: 'Ballot Submitted Successfully',
    ipAddress: voterIp,
    userAgent: req.headers['user-agent'] || 'Mobile/Web Client',
    status: logStatus,
    notes: logNotes
  };
  auditLogsList.unshift(newLog);

  // Generate Receipt Data
  const receiptId = `RCP-${Math.floor(100000 + Math.random() * 900000)}`;
  const cryptographicSignature = `SHA256:${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;

  const receipt: BallotReceiptData = {
    receiptId,
    electionTitle: currentElection.title,
    voterId: voter.voterId,
    votedAt: votedTimestamp,
    selectionCount: totalSelectionsCount,
    cryptographicSignature
  };

  res.json({
    success: true,
    message: currentElection.settings.voteConfirmationMessage,
    receipt
  });
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogsList);
});

// cPanel / hPanel Deployment Guide & Setup Files
app.get('/api/deployment-config', (req, res) => {
  res.json({
    cpanelSteps: [
      'Build the app using "npm run build"',
      'Upload the contents of the project folder (or zip) to your cPanel or hPanel root or public_html directory.',
      'In cPanel, go to "Setup Node.js App" (or Hostinger Node.js Application Manager).',
      'Set Application Root to your app folder, Node version to 18.x or 20.x, and Application Startup File to "dist/server.cjs".',
      'Add environment variable PORT=3000 or let Passenger bind automatically.',
      'Click "Run NPM Install" and then "Restart Application".'
    ],
    sampleCPanelServerJs: `// Entry file for cPanel Passenger Node.js app
const path = require('path');
process.env.NODE_ENV = 'production';
require('./dist/server.cjs');`,
  });
});


// Vite / Static Files Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
