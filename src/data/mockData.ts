import { Election, Voter, AuditLog } from '../types';

export const initialElection: Election = {
  id: 'election-1001',
  title: 'New Election',
  status: 'Active',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  timezone: 'Asia/Kolkata',
  questions: [],
  settings: {
    weightedVoting: false,
    ballotReceipt: true,
    submitBallotConfirmation: true,
    submitBallotConfirmationMessage: 'Are you sure you want to submit your ballot? Your choice will be securely encrypted.',
    loginInstructions: 'Please enter your Voter ID and Voter Key provided by the Election Commission.',
    voteConfirmationMessage: 'Thank you for taking your time to vote!',
    afterElectionMessage: 'Voting is currently closed. Please contact your election administrator if you have questions.',
    enableEmail: true,
    automaticVoterLogin: true,
    emailFromName: 'eTelna Election Commission',
    emailSubject: 'You are invited to vote in the election',
    emailBodyTemplate: 'Dear %name%,\n\nYou are invited to participate in the election using the credentials below:\n\nVoter ID: %voter_id%\nVoter Key: %voter_key%\n\nThank you.',
    emailReminderSubject: 'Voting Reminder',
    emailReminderBodyTemplate: 'Dear %name%,\n\nThis is a friendly reminder to cast your vote before the deadline.\n\nYour Voter ID: %voter_id%\nYour Voter Key: %voter_key%',
    hideResultsDuringElection: false,
    allowDuplicateWriteIn: false,
    isResultsPublished: false,
  }
};

export const initialVoters: Voter[] = [];

export const initialAuditLogs: AuditLog[] = [];

