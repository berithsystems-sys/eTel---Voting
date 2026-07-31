import { Election, Voter, AuditLog } from '../types';

export const initialElection: Election = {
  id: 'election-1001',
  title: 'eTelna Official Voting Campaign',
  description: 'Official online voting portal for electing board members and organization resolutions.',
  status: 'Active',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  timezone: 'Asia/Kolkata',
  questions: [
    {
      id: 'q-101',
      question: 'Board Member Selection',
      description: 'Select up to 2 candidates for the executive board.',
      maxSelections: 2,
      minSelections: 1,
      options: [
        {
          id: 'opt-1',
          title: 'Sarah Jenkins',
          shortDescription: 'Progressive Alliance candidate for board seat.',
          description: 'Senior Director with 10+ years experience in strategic management.',
          votesCount: 14
        },
        {
          id: 'opt-2',
          title: 'David Chen',
          shortDescription: 'Innovation Leadership candidate for board seat.',
          description: 'Head of Technology and Operations, focus on digital transformation.',
          votesCount: 21
        },
        {
          id: 'opt-3',
          title: 'Maria Rodriguez',
          shortDescription: 'Community First candidate for board seat.',
          description: 'Community advocate and governance expert.',
          votesCount: 9
        }
      ]
    }
  ],
  settings: {
    weightedVoting: false,
    ballotReceipt: true,
    submitBallotConfirmation: true,
    submitBallotConfirmationMessage: 'Are you sure you want to submit your ballot? Your choice will be securely encrypted.',
    loginInstructions: 'Please enter your Voter ID and Voter Key provided by the Election Commission.',
    voteConfirmationMessage: 'Thank you for taking your time to vote! Your vote has been securely recorded and sealed.',
    afterElectionMessage: 'Voting is currently closed. Please contact your election administrator if you have questions.',
    enableEmail: true,
    automaticVoterLogin: true,
    emailFromName: 'eTelna Election Commission',
    emailSubject: 'You are invited to vote in the election',
    emailBodyTemplate: 'Dear %name%,\n\nYou are invited to participate in the election using the credentials below:\n\nVoter ID: %voter_id%\nVoter Key: %voter_key%\nVoting Link: %voting_link%\n\nThank you.',
    emailReminderSubject: 'Voting Reminder',
    emailReminderBodyTemplate: 'Dear %name%,\n\nThis is a friendly reminder to cast your vote before the deadline.\n\nYour Voter ID: %voter_id%\nYour Voter Key: %voter_key%\nVoting Link: %voting_link%',
    hideResultsDuringElection: false,
    allowDuplicateWriteIn: false,
    isResultsPublished: false,
    emailProvider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'elections@etelna.org',
    smtpPass: '••••••••••••',
    smtpSecure: true
  }
};

export const initialVoters: Voter[] = [];

export const initialAuditLogs: AuditLog[] = [];

