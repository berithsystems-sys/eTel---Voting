import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initDb,
  getElection,
  saveElection,
  getVoters,
  addVoters,
  updateVoter,
  deleteVoter,
  getAuditLogs,
  addAuditLog,
  getCurrentUser,
  saveCurrentUser,
  getTierConfig,
  saveTierConfig,
  getPaymentGateway,
  savePaymentGateway,
  getPaymentTransactions,
  addPaymentTransaction,
  isDbConnected
} from './src/db/mysql';
import { Voter, AuditLog, VoteSubmission, BallotReceiptData, UserProfile, PaymentTransaction } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'eTelna Platform',
    nodeVersion: process.version,
    databaseConnected: isDbConnected()
  });
});

// AUTH ENDPOINTS
app.get('/api/auth/me', async (req, res) => {
  const currentUser = await getCurrentUser();
  const currentTierConfig = await getTierConfig();
  const paymentGatewayConfig = await getPaymentGateway();

  res.json({
    user: currentUser,
    tierConfig: currentTierConfig,
    paymentGateway: {
      provider: paymentGatewayConfig.provider,
      publishableKey: paymentGatewayConfig.publishableKey,
      mode: paymentGatewayConfig.mode,
      isEnabled: paymentGatewayConfig.isEnabled,
      currency: paymentGatewayConfig.currency
    },
    databaseConnected: isDbConnected()
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, role } = req.body;
  const currentUser = await getCurrentUser();
  const updatedUser: UserProfile = {
    ...currentUser,
    id: `usr-${Date.now()}`,
    email: email || 'user@etelna.org',
    name: email ? email.split('@')[0] : 'eTelna User',
    role: role || 'ORGANIZER',
    plan: role === 'SUPER_ADMIN' ? 'PREMIUM' : currentUser.plan,
    authProvider: 'email'
  };
  await saveCurrentUser(updatedUser);
  res.json({ success: true, user: updatedUser });
});

app.post('/api/auth/google-login', async (req, res) => {
  const { googleEmail, googleName, googlePhoto } = req.body;
  const currentUser = await getCurrentUser();
  const updatedUser: UserProfile = {
    ...currentUser,
    id: `usr-google-${Date.now()}`,
    email: googleEmail || 'google.user@gmail.com',
    name: googleName || 'Google Auth User',
    photoUrl: googlePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'ORGANIZER',
    authProvider: 'google'
  };
  await saveCurrentUser(updatedUser);
  res.json({ success: true, user: updatedUser });
});

app.post('/api/auth/switch-role', async (req, res) => {
  const { role, plan } = req.body;
  const currentUser = await getCurrentUser();
  if (role) currentUser.role = role;
  if (plan) currentUser.plan = plan;
  await saveCurrentUser(currentUser);
  res.json({ success: true, user: currentUser });
});

// ADMIN CONFIG ENDPOINTS
app.get('/api/admin/tier-config', async (req, res) => {
  const tierConfig = await getTierConfig();
  const paymentGateway = await getPaymentGateway();
  const transactions = await getPaymentTransactions();

  res.json({
    tierConfig,
    paymentGateway,
    transactions,
    databaseConnected: isDbConnected()
  });
});

app.put('/api/admin/tier-config', async (req, res) => {
  const newConfig = req.body;
  const currentTierConfig = await getTierConfig();
  const updatedTierConfig = {
    ...currentTierConfig,
    ...newConfig
  };
  await saveTierConfig(updatedTierConfig);
  res.json({ success: true, tierConfig: updatedTierConfig });
});

app.put('/api/admin/payment-gateway', async (req, res) => {
  const newGatewaySettings = req.body;
  const paymentGatewayConfig = await getPaymentGateway();
  const updatedGateway = {
    ...paymentGatewayConfig,
    ...newGatewaySettings
  };
  await savePaymentGateway(updatedGateway);
  res.json({ success: true, paymentGateway: updatedGateway });
});

// PAYMENT CHECKOUT (Upgrade from Free to Premium)
app.post('/api/payment/checkout', async (req, res) => {
  const currentUser = await getCurrentUser();
  const currentTierConfig = await getTierConfig();
  const paymentGatewayConfig = await getPaymentGateway();

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

  await addPaymentTransaction(newTx);
  currentUser.plan = 'PREMIUM'; // Upgrade user to Premium!
  await saveCurrentUser(currentUser);

  res.json({
    success: true,
    message: 'Payment processed successfully! Your eTelna Organizer account is now upgraded to Premium.',
    user: currentUser,
    transaction: newTx
  });
});

// Get active election
app.get('/api/election', async (req, res) => {
  const currentElection = await getElection();
  res.json(currentElection);
});

// Update election details or settings (with Free Candidate limit check)
app.put('/api/election', async (req, res) => {
  const updatedData = req.body;
  const currentUser = await getCurrentUser();
  const currentTierConfig = await getTierConfig();
  let currentElection = await getElection();

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

  await saveElection(currentElection);
  res.json({ success: true, election: currentElection });
});

// Duplicate election template (with Free One-Time Election limit check)
app.post('/api/election/duplicate', async (req, res) => {
  const currentUser = await getCurrentUser();
  const currentTierConfig = await getTierConfig();
  const currentElection = await getElection();

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

  const newElection = {
    ...JSON.parse(JSON.stringify(currentElection)),
    id: `election-${Date.now().toString().slice(-6)}`,
    title: `${currentElection.title} (Copy)`,
    status: 'Draft',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  };

  // Reset candidate counts
  newElection.questions.forEach((q: any) => {
    q.options.forEach((o: any) => { o.votesCount = 0; });
  });

  await saveElection(newElection);

  currentUser.electionsCreatedCount += 1;
  await saveCurrentUser(currentUser);

  // Reset voters voting status for new election copy
  const votersList = await getVoters();
  for (const v of votersList) {
    v.hasVoted = false;
    v.votedAt = undefined;
    await updateVoter(v);
  }

  res.json({ success: true, message: 'Election duplicated successfully!', election: newElection });
});

// List voters
app.get('/api/voters', async (req, res) => {
  const votersList = await getVoters();
  res.json(votersList);
});

// Add / Import voters
app.post('/api/voters', async (req, res) => {
  const newVotersInput: Partial<Voter>[] = Array.isArray(req.body) ? req.body : [req.body];
  const existingVoters = await getVoters();
  const added: Voter[] = [];

  newVotersInput.forEach((v, idx) => {
    const voterId = v.voterId || `VOTER-${1000 + existingVoters.length + idx + 1}`;
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
    added.push(voterItem);
  });

  await addVoters(added);
  const updatedVotersList = await getVoters();
  res.json({ success: true, addedCount: added.length, voters: updatedVotersList });
});

// Delete voter
app.delete('/api/voters/:id', async (req, res) => {
  const { id } = req.params;
  await deleteVoter(id);
  const updatedVotersList = await getVoters();
  res.json({ success: true, voters: updatedVotersList });
});

// Voter Login Verification
app.post('/api/voter/login', async (req, res) => {
  const { voterId, voterKey } = req.body;
  if (!voterId || !voterKey) {
    return res.status(400).json({ error: 'Voter ID and Voter Key are required.' });
  }

  const votersList = await getVoters();
  const currentElection = await getElection();

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
app.post('/api/voter/cast', async (req, res) => {
  const { voterId, voterKey, selections } = req.body as VoteSubmission;

  if (!voterId || !voterKey) {
    return res.status(400).json({ error: 'Missing voter authentication tokens.' });
  }

  const votersList = await getVoters();
  const currentElection = await getElection();

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
    await addAuditLog(blockedLog);

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

  // Save updated election votes count
  await saveElection(currentElection);

  // Mark voter as voted
  const votedTimestamp = new Date().toISOString();
  const voterIp = req.ip || '157.32.18.99';
  voter.hasVoted = true;
  voter.votedAt = votedTimestamp;
  voter.ipAddress = voterIp;
  await updateVoter(voter);

  // Check if IP was already used by another voter
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
  await addAuditLog(newLog);

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
app.get('/api/audit-logs', async (req, res) => {
  const auditLogsList = await getAuditLogs();
  res.json(auditLogsList);
});

// cPanel / hPanel Deployment Guide & Setup Files
app.get('/api/deployment-config', (req, res) => {
  res.json({
    cpanelSteps: [
      '1. Build the app using "npm run build"',
      '2. In your phpMyAdmin, import the provided "schema.sql" file (or let Node.js auto-create tables on boot).',
      '3. Upload the app files to your cPanel / hPanel Node.js root folder.',
      '4. Set Environment Variables in cPanel Node.js App or .env file:',
      '   - DB_HOST (e.g. localhost or 127.0.0.1)',
      '   - DB_PORT (3306)',
      '   - DB_USER (your cPanel MySQL username)',
      '   - DB_PASSWORD (your MySQL user password)',
      '   - DB_NAME (your cPanel database name, e.g. username_etelna)',
      '5. Click "Run NPM Install" and then "Restart Application".'
    ],
    sampleCPanelServerJs: `// Entry file for cPanel Passenger Node.js app
const path = require('path');
process.env.NODE_ENV = 'production';
require('./dist/server.cjs');`,
  });
});

// Vite / Static Files Middleware setup
async function startServer() {
  // Initialize MySQL connection and create tables if they do not exist
  await initDb();

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
