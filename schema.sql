-- eTelna Online Voting Engine - MySQL Database Schema for phpMyAdmin
-- Compatible with MySQL 5.7+ & MySQL 8.0+ / MariaDB
-- Use this file to manually create database tables in phpMyAdmin if desired.
-- NOTE: The Node.js server automatically runs CREATE TABLE IF NOT EXISTS on boot.

CREATE DATABASE IF NOT EXISTS `etelna_voting` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `etelna_voting`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) DEFAULT 'admin123',
  `photoUrl` TEXT,
  `role` VARCHAR(50) DEFAULT 'ORGANIZER',
  `plan` VARCHAR(50) DEFAULT 'FREE',
  `authProvider` VARCHAR(50) DEFAULT 'email',
  `electionsCreatedCount` INT DEFAULT 0,
  `createdAt` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default Admin user if not exists
INSERT IGNORE INTO `users` (`id`, `email`, `name`, `password`, `photoUrl`, `role`, `plan`, `authProvider`, `electionsCreatedCount`, `createdAt`)
VALUES ('usr-admin-01', 'admin@etelna.com', 'System Admin', 'admin123', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'SUPER_ADMIN', 'PREMIUM', 'email', 0, NOW());

-- 2. Elections Table
CREATE TABLE IF NOT EXISTS `elections` (
  `id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
  `startDate` VARCHAR(255) DEFAULT NULL,
  `endDate` VARCHAR(255) DEFAULT NULL,
  `totalVoters` INT DEFAULT 0,
  `timezone` VARCHAR(100) DEFAULT 'Asia/Kolkata',
  `questions` JSON DEFAULT NULL,
  `settings` JSON DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Voters Table
CREATE TABLE IF NOT EXISTS `voters` (
  `id` VARCHAR(255) NOT NULL,
  `voterId` VARCHAR(255) NOT NULL,
  `voterKey` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `weight` INT DEFAULT 1,
  `hasVoted` TINYINT(1) DEFAULT 0,
  `votedAt` VARCHAR(255) DEFAULT NULL,
  `ipAddress` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_voterId` (`voterId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(255) NOT NULL,
  `timestamp` VARCHAR(255) NOT NULL,
  `voterId` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(255) NOT NULL,
  `ipAddress` VARCHAR(255) DEFAULT NULL,
  `userAgent` TEXT,
  `status` VARCHAR(50) NOT NULL,
  `notes` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tier Config Table
CREATE TABLE IF NOT EXISTS `tier_config` (
  `id` INT NOT NULL,
  `freeMaxCandidates` INT DEFAULT 10,
  `freeMaxElections` INT DEFAULT 1,
  `premiumPrice` INT DEFAULT 2499,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `pricingPeriod` VARCHAR(50) DEFAULT 'LIFETIME',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payment Gateway Config Table
CREATE TABLE IF NOT EXISTS `payment_gateway_config` (
  `id` INT NOT NULL,
  `provider` VARCHAR(50) DEFAULT 'razorpay',
  `publishableKey` TEXT,
  `secretKey` TEXT,
  `webhookSecret` TEXT,
  `mode` VARCHAR(20) DEFAULT 'test',
  `isEnabled` TINYINT(1) DEFAULT 1,
  `currency` VARCHAR(10) DEFAULT 'INR',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Payment Transactions Table
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) DEFAULT NULL,
  `userName` VARCHAR(255) DEFAULT NULL,
  `userEmail` VARCHAR(255) DEFAULT NULL,
  `amount` INT DEFAULT 0,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `provider` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT NULL,
  `transactionRef` VARCHAR(255) DEFAULT NULL,
  `timestamp` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
