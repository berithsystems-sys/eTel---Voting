import mysql from 'mysql2/promise';
import { initialElection, initialVoters, initialAuditLogs } from '../data/mockData';
import { Election, Voter, AuditLog, UserProfile, AdminTierConfig, PaymentGatewayConfig, PaymentTransaction } from '../types';

// MySQL Pool setup from environment variables
const dbHost = process.env.DB_HOST || process.env.MYSQL_HOST || '';
const dbPort = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10);
const dbUser = process.env.DB_USER || process.env.MYSQL_USER || '';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
const dbName = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'etelna_voting';

let pool: mysql.Pool | null = null;
let isMySqlConnected = false;
let lastDbError: string | null = null;

export function getDbDebugInfo() {
  return {
    isMySqlConnected,
    lastDbError,
    dbHost: dbHost || '(Not set)',
    dbPort,
    dbUser: dbUser || '(Not set)',
    dbName: dbName || '(Not set)',
    hasPassword: Boolean(dbPassword)
  };
}

// Fallback in-memory state if MySQL is not configured or unavailable
let memoryElections: Election[] = [JSON.parse(JSON.stringify(initialElection))];
let memoryVoters: Voter[] = [];
let memoryAuditLogs: AuditLog[] = [];
let memoryUsers: (UserProfile & { password?: string })[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@etelna.com',
    name: 'System Admin',
    password: 'admin123',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'SUPER_ADMIN',
    plan: 'PREMIUM',
    authProvider: 'email',
    electionsCreatedCount: 0,
    createdAt: new Date().toISOString()
  }
];
let memoryCurrentUser: UserProfile = {
  id: 'usr-admin-01',
  email: 'admin@etelna.com',
  name: 'System Admin',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'SUPER_ADMIN',
  plan: 'PREMIUM',
  authProvider: 'email',
  electionsCreatedCount: 0,
  createdAt: new Date().toISOString()
};
let memoryTierConfig: AdminTierConfig = {
  freeMaxCandidates: 10,
  freeMaxElections: 1,
  premiumPrice: 2499,
  currency: 'INR',
  pricingPeriod: 'LIFETIME'
};
let memoryPaymentGateway: PaymentGatewayConfig = {
  provider: 'razorpay',
  publishableKey: 'rzp_test_eTelnaLive9918237',
  secretKey: 'sk_test_eTelnaSecretPrivKey',
  webhookSecret: 'whsec_eTelnaWebhookSignature',
  mode: 'test',
  isEnabled: true,
  currency: 'INR'
};
let memoryTransactions: PaymentTransaction[] = [];


export async function initDb(): Promise<boolean> {
  if (!dbHost || !dbUser) {
    const msg = 'MySQL DB_HOST / DB_USER environment variables not configured. Running with in-memory persistence.';
    console.log(`ℹ️ ${msg}`);
    lastDbError = msg;
    isMySqlConnected = false;
    return false;
  }

  try {
    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000 // 5 seconds connection timeout
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log(`✅ Successfully connected to phpMyAdmin MySQL database: ${dbName} @ ${dbHost}`);
    connection.release();
    lastDbError = null;

    // Initialize SQL Tables (CREATE TABLE IF NOT EXISTS preserves all existing data and tables on redeployment)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) DEFAULT 'admin123',
        photoUrl TEXT,
        role VARCHAR(50) DEFAULT 'ORGANIZER',
        plan VARCHAR(50) DEFAULT 'FREE',
        authProvider VARCHAR(50) DEFAULT 'email',
        electionsCreatedCount INT DEFAULT 0,
        createdAt VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure password column exists if table was created previously without it
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN password VARCHAR(255) DEFAULT 'admin123'`);
    } catch (e) {
      // Ignore if column already exists
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS elections (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        startDate VARCHAR(255),
        endDate VARCHAR(255),
        totalVoters INT DEFAULT 0,
        timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
        questions JSON,
        settings JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS voters (
        id VARCHAR(255) PRIMARY KEY,
        voterId VARCHAR(255) NOT NULL UNIQUE,
        voterKey VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        weight INT DEFAULT 1,
        hasVoted TINYINT(1) DEFAULT 0,
        votedAt VARCHAR(255),
        ipAddress VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        timestamp VARCHAR(255) NOT NULL,
        voterId VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        ipAddress VARCHAR(255),
        userAgent TEXT,
        status VARCHAR(50) NOT NULL,
        notes TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tier_config (
        id INT PRIMARY KEY,
        freeMaxCandidates INT DEFAULT 10,
        freeMaxElections INT DEFAULT 1,
        premiumPrice INT DEFAULT 2499,
        currency VARCHAR(10) DEFAULT 'INR',
        pricingPeriod VARCHAR(50) DEFAULT 'LIFETIME'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_gateway_config (
        id INT PRIMARY KEY,
        provider VARCHAR(50) DEFAULT 'razorpay',
        publishableKey TEXT,
        secretKey TEXT,
        webhookSecret TEXT,
        mode VARCHAR(20) DEFAULT 'test',
        isEnabled TINYINT(1) DEFAULT 1,
        currency VARCHAR(10) DEFAULT 'INR'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        userName VARCHAR(255),
        userEmail VARCHAR(255),
        amount INT,
        currency VARCHAR(10),
        provider VARCHAR(50),
        status VARCHAR(50),
        transactionRef VARCHAR(255),
        timestamp VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // SEED INITIAL DATA ONLY IF TABLES ARE COMPLETELY EMPTY
    const [electionsCount]: any = await pool.query(`SELECT COUNT(*) as count FROM elections`);
    if (electionsCount[0].count === 0 && memoryElections.length > 0) {
      const initEl = memoryElections[0];
      await pool.query(
        `INSERT INTO elections (id, title, description, status, startDate, endDate, totalVoters, timezone, questions, settings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          initEl.id,
          initEl.title,
          initEl.description,
          initEl.status,
          initEl.startDate,
          initEl.endDate,
          initEl.totalVoters,
          initEl.timezone,
          JSON.stringify(initEl.questions),
          JSON.stringify(initEl.settings)
        ]
      );
      console.log('🌱 Seeded default clean election into MySQL.');
    }

    const [votersCount]: any = await pool.query(`SELECT COUNT(*) as count FROM voters`);
    if (votersCount[0].count === 0) {
      for (const v of memoryVoters) {
        await pool.query(
          `INSERT INTO voters (id, voterId, voterKey, name, email, weight, hasVoted, votedAt, ipAddress)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [v.id, v.voterId, v.voterKey, v.name, v.email, v.weight, v.hasVoted ? 1 : 0, v.votedAt || null, v.ipAddress || null]
        );
      }
    }

    const [logsCount]: any = await pool.query(`SELECT COUNT(*) as count FROM audit_logs`);
    if (logsCount[0].count === 0) {
      for (const log of memoryAuditLogs) {
        await pool.query(
          `INSERT INTO audit_logs (id, timestamp, voterId, action, ipAddress, userAgent, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [log.id, log.timestamp, log.voterId, log.action, log.ipAddress, log.userAgent, log.status, log.notes]
        );
      }
    }

    const [usersCount]: any = await pool.query(`SELECT COUNT(*) as count FROM users`);
    if (usersCount[0].count === 0) {
      await pool.query(
        `INSERT INTO users (id, email, name, password, photoUrl, role, plan, authProvider, electionsCreatedCount, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memoryCurrentUser.id,
          memoryCurrentUser.email,
          memoryCurrentUser.name,
          'admin123',
          memoryCurrentUser.photoUrl,
          memoryCurrentUser.role,
          memoryCurrentUser.plan,
          memoryCurrentUser.authProvider,
          memoryCurrentUser.electionsCreatedCount,
          memoryCurrentUser.createdAt
        ]
      );
      console.log('🌱 Seeded System Admin user (admin@etelna.com / admin123) into MySQL.');
    }


    const [tierCount]: any = await pool.query(`SELECT COUNT(*) as count FROM tier_config`);
    if (tierCount[0].count === 0) {
      await pool.query(
        `INSERT INTO tier_config (id, freeMaxCandidates, freeMaxElections, premiumPrice, currency, pricingPeriod)
         VALUES (1, ?, ?, ?, ?, ?)`,
        [
          memoryTierConfig.freeMaxCandidates,
          memoryTierConfig.freeMaxElections,
          memoryTierConfig.premiumPrice,
          memoryTierConfig.currency,
          memoryTierConfig.pricingPeriod
        ]
      );
    }

    const [gatewayCount]: any = await pool.query(`SELECT COUNT(*) as count FROM payment_gateway_config`);
    if (gatewayCount[0].count === 0) {
      await pool.query(
        `INSERT INTO payment_gateway_config (id, provider, publishableKey, secretKey, webhookSecret, mode, isEnabled, currency)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memoryPaymentGateway.provider,
          memoryPaymentGateway.publishableKey,
          memoryPaymentGateway.secretKey,
          memoryPaymentGateway.webhookSecret,
          memoryPaymentGateway.mode,
          memoryPaymentGateway.isEnabled ? 1 : 0,
          memoryPaymentGateway.currency
        ]
      );
    }

    const [txCount]: any = await pool.query(`SELECT COUNT(*) as count FROM payment_transactions`);
    if (txCount[0].count === 0) {
      for (const tx of memoryTransactions) {
        await pool.query(
          `INSERT INTO payment_transactions (id, userId, userName, userEmail, amount, currency, provider, status, transactionRef, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [tx.id, tx.userId, tx.userName, tx.userEmail, tx.amount, tx.currency, tx.provider, tx.status, tx.transactionRef, tx.timestamp]
        );
      }
    }

    isMySqlConnected = true;
    return true;
  } catch (error: any) {
    const errMessage = error?.message || String(error);
    console.error('❌ Failed to connect to MySQL database:', errMessage);
    console.log('⚠️ Falling back to in-memory store. Verify your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME settings.');
    lastDbError = errMessage;
    isMySqlConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isMySqlConnected;
}

// --- DB ACCESSORS & MUTATORS ---

export async function getElections(): Promise<Election[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM elections ORDER BY updated_at DESC`);
      if (rows && rows.length > 0) {
        return rows.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          startDate: row.startDate,
          endDate: row.endDate,
          totalVoters: row.totalVoters,
          timezone: row.timezone,
          questions: typeof row.questions === 'string' ? JSON.parse(row.questions) : row.questions,
          settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings
        }));
      }
    } catch (err) {
      console.error('MySQL Error in getElections:', err);
    }
  }
  return memoryElections;
}

export async function getElection(id?: string): Promise<Election> {
  const electionsList = await getElections();
  if (id) {
    const found = electionsList.find(e => e.id === id);
    if (found) return found;
  }
  return electionsList[0] || initialElection;
}

export async function saveElection(election: Election): Promise<void> {
  const existingIdx = memoryElections.findIndex(e => e.id === election.id);
  if (existingIdx >= 0) {
    memoryElections[existingIdx] = election;
  } else {
    memoryElections.unshift(election);
  }

  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO elections (id, title, description, status, startDate, endDate, totalVoters, timezone, questions, settings)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           description = VALUES(description),
           status = VALUES(status),
           startDate = VALUES(startDate),
           endDate = VALUES(endDate),
           totalVoters = VALUES(totalVoters),
           timezone = VALUES(timezone),
           questions = VALUES(questions),
           settings = VALUES(settings)`,
        [
          election.id,
          election.title,
          election.description,
          election.status,
          election.startDate,
          election.endDate,
          election.totalVoters,
          election.timezone,
          JSON.stringify(election.questions),
          JSON.stringify(election.settings)
        ]
      );
    } catch (err) {
      console.error('MySQL Error in saveElection:', err);
    }
  }
}

export async function deleteElection(id: string): Promise<void> {
  memoryElections = memoryElections.filter(e => e.id !== id);
  if (isMySqlConnected && pool) {
    try {
      await pool.query(`DELETE FROM elections WHERE id = ?`, [id]);
    } catch (err) {
      console.error('MySQL Error in deleteElection:', err);
    }
  }
}

export async function getVoters(): Promise<Voter[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM voters`);
      if (rows) {
        return rows.map((r: any) => ({
          id: r.id,
          voterId: r.voterId,
          voterKey: r.voterKey,
          name: r.name,
          email: r.email,
          weight: r.weight,
          hasVoted: Boolean(r.hasVoted),
          votedAt: r.votedAt || undefined,
          ipAddress: r.ipAddress || undefined
        }));
      }
    } catch (err) {
      console.error('MySQL Error in getVoters:', err);
    }
  }
  return memoryVoters;
}

export async function addVoters(newVoters: Voter[]): Promise<void> {
  memoryVoters.push(...newVoters);
  if (isMySqlConnected && pool) {
    try {
      for (const v of newVoters) {
        await pool.query(
          `INSERT INTO voters (id, voterId, voterKey, name, email, weight, hasVoted, votedAt, ipAddress)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             voterKey = VALUES(voterKey),
             name = VALUES(name),
             email = VALUES(email),
             weight = VALUES(weight)`,
          [v.id, v.voterId, v.voterKey, v.name, v.email, v.weight, v.hasVoted ? 1 : 0, v.votedAt || null, v.ipAddress || null]
        );
      }
    } catch (err) {
      console.error('MySQL Error in addVoters:', err);
    }
  }
}

export async function updateVoter(voter: Voter): Promise<void> {
  const index = memoryVoters.findIndex(v => v.id === voter.id || v.voterId === voter.voterId);
  if (index !== -1) memoryVoters[index] = voter;

  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `UPDATE voters SET hasVoted = ?, votedAt = ?, ipAddress = ? WHERE voterId = ? OR id = ?`,
        [voter.hasVoted ? 1 : 0, voter.votedAt || null, voter.ipAddress || null, voter.voterId, voter.id]
      );
    } catch (err) {
      console.error('MySQL Error in updateVoter:', err);
    }
  }
}

export async function deleteVoter(idOrVoterId: string): Promise<void> {
  memoryVoters = memoryVoters.filter(v => v.id !== idOrVoterId && v.voterId !== idOrVoterId);
  if (isMySqlConnected && pool) {
    try {
      await pool.query(`DELETE FROM voters WHERE id = ? OR voterId = ?`, [idOrVoterId, idOrVoterId]);
    } catch (err) {
      console.error('MySQL Error in deleteVoter:', err);
    }
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM audit_logs ORDER BY timestamp DESC`);
      if (rows) {
        return rows.map((r: any) => ({
          id: r.id,
          timestamp: r.timestamp,
          voterId: r.voterId,
          action: r.action,
          ipAddress: r.ipAddress,
          userAgent: r.userAgent,
          status: r.status,
          notes: r.notes
        }));
      }
    } catch (err) {
      console.error('MySQL Error in getAuditLogs:', err);
    }
  }
  return memoryAuditLogs;
}

export async function addAuditLog(log: AuditLog): Promise<void> {
  memoryAuditLogs.unshift(log);
  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, timestamp, voterId, action, ipAddress, userAgent, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [log.id, log.timestamp, log.voterId, log.action, log.ipAddress, log.userAgent, log.status, log.notes]
      );
    } catch (err) {
      console.error('MySQL Error in addAuditLog:', err);
    }
  }
}

export async function validateUserLogin(
  emailInput: string,
  passwordInput?: string,
  isSignUp?: boolean,
  nameInput?: string
): Promise<UserProfile> {
  const clean = (emailInput || '').trim().toLowerCase();
  const pass = (passwordInput || '').trim();

  // 1. SIGN UP REGISTRATION MODE
  if (isSignUp) {
    if (clean === 'admin@etelna.com' || clean === 'admin') {
      throw new Error('This email address is reserved for System Administrator. Please Sign In.');
    }

    if (isMySqlConnected && pool) {
      const [existing]: any = await pool.query(
        `SELECT id FROM users WHERE LOWER(email) = ? OR id = ? LIMIT 1`,
        [clean, clean]
      );
      if (existing && existing.length > 0) {
        throw new Error('An account with this email/username already exists. Please Sign In.');
      }
    } else {
      const existingInMemory = memoryUsers.find(
        u => u.email.toLowerCase() === clean || u.id.toLowerCase() === clean
      );
      if (existingInMemory) {
        throw new Error('An account with this email/username already exists. Please Sign In.');
      }
    }

    const newUserId = `usr-${Date.now()}`;
    const newUserName = nameInput?.trim() || clean.split('@')[0] || 'Organizer';
    const newUserEmail = clean.includes('@') ? clean : `${clean}@etelna.org`;

    const newUser: UserProfile = {
      id: newUserId,
      email: newUserEmail,
      name: newUserName,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'ORGANIZER',
      plan: 'FREE',
      authProvider: 'email',
      electionsCreatedCount: 0,
      createdAt: new Date().toISOString(),
      isLoggedIn: true
    };

    if (isMySqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO users (id, email, name, password, photoUrl, role, plan, authProvider, electionsCreatedCount, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newUserId, newUserEmail, newUserName, pass || 'admin123', newUser.photoUrl, 'ORGANIZER', 'FREE', 'email', 0, newUser.createdAt]
        );
      } catch (e) {
        console.error('Failed to insert user into MySQL:', e);
      }
    }

    memoryUsers.push({ ...newUser, password: pass || 'admin123' });
    await saveCurrentUser(newUser);
    return newUser;
  }

  // 2. SIGN IN / LOGIN MODE
  // System Admin Check
  if (clean === 'admin@etelna.com' || clean === 'admin') {
    if (pass && pass !== 'admin123') {
      throw new Error('Incorrect password for System Admin.');
    }
    const adminUser: UserProfile = {
      id: 'usr-admin-01',
      email: 'admin@etelna.com',
      name: 'System Admin',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'SUPER_ADMIN',
      plan: 'PREMIUM',
      authProvider: 'email',
      electionsCreatedCount: 0,
      createdAt: new Date().toISOString(),
      isLoggedIn: true
    };
    await saveCurrentUser(adminUser);
    return adminUser;
  }

  // Check MySQL DB
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(
        `SELECT * FROM users WHERE LOWER(email) = ? OR id = ? LIMIT 1`,
        [clean, clean]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        if (r.password && pass && r.password !== pass) {
          throw new Error('Incorrect password. Please verify your credentials.');
        }
        const userObj: UserProfile = {
          id: r.id,
          email: r.email,
          name: r.name,
          photoUrl: r.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: r.role || 'ORGANIZER',
          plan: r.plan || 'FREE',
          authProvider: r.authProvider || 'email',
          electionsCreatedCount: r.electionsCreatedCount || 0,
          createdAt: r.createdAt || new Date().toISOString(),
          isLoggedIn: true
        };
        await saveCurrentUser(userObj);
        return userObj;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Incorrect password') || err.message.includes('reserved'))) {
        throw err;
      }
    }
  }

  // Check in-memory users list
  const foundMem = memoryUsers.find(
    u => u.email.toLowerCase() === clean || u.id.toLowerCase() === clean
  );
  if (foundMem) {
    if (foundMem.password && pass && foundMem.password !== pass) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }
    const userObj = { ...foundMem, isLoggedIn: true };
    await saveCurrentUser(userObj);
    return userObj;
  }

  // No matching user found
  throw new Error('Account not found with this email/username. Please check your credentials or click Sign Up to register.');
}

export async function getCurrentUser(): Promise<UserProfile> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM users LIMIT 1`);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          email: r.email,
          name: r.name,
          photoUrl: r.photoUrl,
          role: r.role,
          plan: r.plan,
          authProvider: r.authProvider,
          electionsCreatedCount: r.electionsCreatedCount,
          createdAt: r.createdAt
        };
      }
    } catch (err) {
      console.error('MySQL Error in getCurrentUser:', err);
    }
  }
  return memoryCurrentUser;
}

export async function saveCurrentUser(user: UserProfile): Promise<void> {
  memoryCurrentUser = user;
  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO users (id, email, name, photoUrl, role, plan, authProvider, electionsCreatedCount, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           email = VALUES(email),
           name = VALUES(name),
           photoUrl = VALUES(photoUrl),
           role = VALUES(role),
           plan = VALUES(plan),
           authProvider = VALUES(authProvider),
           electionsCreatedCount = VALUES(electionsCreatedCount)`,
        [user.id, user.email, user.name, user.photoUrl, user.role, user.plan, user.authProvider, user.electionsCreatedCount, user.createdAt]
      );
    } catch (err) {
      console.error('MySQL Error in saveCurrentUser:', err);
    }
  }
}

export async function getTierConfig(): Promise<AdminTierConfig> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM tier_config WHERE id = 1`);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          freeMaxCandidates: r.freeMaxCandidates,
          freeMaxElections: r.freeMaxElections,
          premiumPrice: r.premiumPrice,
          currency: r.currency,
          pricingPeriod: r.pricingPeriod
        };
      }
    } catch (err) {
      console.error('MySQL Error in getTierConfig:', err);
    }
  }
  return memoryTierConfig;
}

export async function saveTierConfig(config: AdminTierConfig): Promise<void> {
  memoryTierConfig = config;
  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO tier_config (id, freeMaxCandidates, freeMaxElections, premiumPrice, currency, pricingPeriod)
         VALUES (1, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           freeMaxCandidates = VALUES(freeMaxCandidates),
           freeMaxElections = VALUES(freeMaxElections),
           premiumPrice = VALUES(premiumPrice),
           currency = VALUES(currency),
           pricingPeriod = VALUES(pricingPeriod)`,
        [config.freeMaxCandidates, config.freeMaxElections, config.premiumPrice, config.currency, config.pricingPeriod]
      );
    } catch (err) {
      console.error('MySQL Error in saveTierConfig:', err);
    }
  }
}

export async function getPaymentGateway(): Promise<PaymentGatewayConfig> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM payment_gateway_config WHERE id = 1`);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          provider: r.provider,
          publishableKey: r.publishableKey,
          secretKey: r.secretKey,
          webhookSecret: r.webhookSecret,
          mode: r.mode,
          isEnabled: Boolean(r.isEnabled),
          currency: r.currency
        };
      }
    } catch (err) {
      console.error('MySQL Error in getPaymentGateway:', err);
    }
  }
  return memoryPaymentGateway;
}

export async function savePaymentGateway(gateway: PaymentGatewayConfig): Promise<void> {
  memoryPaymentGateway = gateway;
  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO payment_gateway_config (id, provider, publishableKey, secretKey, webhookSecret, mode, isEnabled, currency)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           provider = VALUES(provider),
           publishableKey = VALUES(publishableKey),
           secretKey = VALUES(secretKey),
           webhookSecret = VALUES(webhookSecret),
           mode = VALUES(mode),
           isEnabled = VALUES(isEnabled),
           currency = VALUES(currency)`,
        [gateway.provider, gateway.publishableKey, gateway.secretKey, gateway.webhookSecret, gateway.mode, gateway.isEnabled ? 1 : 0, gateway.currency]
      );
    } catch (err) {
      console.error('MySQL Error in savePaymentGateway:', err);
    }
  }
}

export async function getPaymentTransactions(): Promise<PaymentTransaction[]> {
  if (isMySqlConnected && pool) {
    try {
      const [rows]: any = await pool.query(`SELECT * FROM payment_transactions ORDER BY timestamp DESC`);
      if (rows) {
        return rows.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          userEmail: r.userEmail,
          amount: r.amount,
          currency: r.currency,
          provider: r.provider,
          status: r.status,
          transactionRef: r.transactionRef,
          timestamp: r.timestamp
        }));
      }
    } catch (err) {
      console.error('MySQL Error in getPaymentTransactions:', err);
    }
  }
  return memoryTransactions;
}

export async function addPaymentTransaction(tx: PaymentTransaction): Promise<void> {
  memoryTransactions.unshift(tx);
  if (isMySqlConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO payment_transactions (id, userId, userName, userEmail, amount, currency, provider, status, transactionRef, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tx.id, tx.userId, tx.userName, tx.userEmail, tx.amount, tx.currency, tx.provider, tx.status, tx.transactionRef, tx.timestamp]
      );
    } catch (err) {
      console.error('MySQL Error in addPaymentTransaction:', err);
    }
  }
}
