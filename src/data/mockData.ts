import { Election, Voter, AuditLog } from '../types';

export const initialElection: Election = {
  id: 'election-262249',
  title: 'Vision Lamka Election 2022',
  status: 'Completed',
  startDate: '2022-06-29T14:00:00.000Z',
  endDate: '2022-07-01T16:00:00.000Z',
  timezone: 'Asia/Kolkata',
  questions: [
    {
      id: 'q-101',
      question: 'Vision Lamka Managing Committee (July 2022 - July 2025)',
      description: 'Please select up to 9 members for the executive managing committee term.',
      maxSelections: 9,
      minSelections: 1,
      options: [
        {
          id: 'opt-1',
          title: 'NEKKHOMANG NEIHSIAL',
          shortDescription: 'NEW DELHI',
          description: 'Former Senior Government Officer with 25+ years in public service and community leadership.',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          votesCount: 31,
        },
        {
          id: 'opt-2',
          title: 'VUMCHINPAU',
          shortDescription: 'LAMKA CENTRAL',
          description: 'Educationist and social worker dedicated to youth skill building and civic engagement.',
          photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          votesCount: 27,
        },
        {
          id: 'opt-3',
          title: 'THAWNGZACHIN CHINSUM NAULAK',
          shortDescription: 'NEW LAMKA',
          description: 'Community advocate specializing in regional infrastructure development and public health outreach.',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          votesCount: 27,
        },
        {
          id: 'opt-4',
          title: 'LEIVANG THONKHOKAM NGAIHTE',
          shortDescription: 'ZENHANG LAMKA',
          description: 'Financial advisor and volunteer coordinator for regional social welfare programs.',
          photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          votesCount: 23,
        },
        {
          id: 'opt-5',
          title: 'NEHJAMANG SIMTE',
          shortDescription: 'HIANGTAM LAMKA',
          description: 'Active youth organizer with extensive background in sports development and cultural preservation.',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          votesCount: 22,
        },
        {
          id: 'opt-6',
          title: 'P GANGTE',
          shortDescription: 'TUINUAI',
          description: 'Legal expert focused on constitutional governance and non-profit organization administration.',
          photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
          votesCount: 19,
        },
        {
          id: 'opt-7',
          title: 'NGAMKHOTINTHANG SITLHOU',
          shortDescription: 'RENGKAI',
          description: 'Community elder and philanthropist working in healthcare accessibility and emergency aid.',
          photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
          votesCount: 15,
        },
        {
          id: 'opt-8',
          title: 'LALDATLIEN TUSING',
          shortDescription: 'SAPAIA',
          description: 'Environmental engineer and local sustainability campaign leader.',
          photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          votesCount: 15,
        },
        {
          id: 'opt-9',
          title: 'KONTHANG TOUTHANG',
          shortDescription: 'KANGVAI',
          description: 'Entrepreneur and mentor driving local micro-enterprise initiatives.',
          photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
          votesCount: 12,
        },
        {
          id: 'opt-10',
          title: 'SONPI VAIPHEI',
          shortDescription: 'CHURACHANDPUR',
          description: 'Teacher and literacy campaigner driving digital literacy programs across schools.',
          photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          votesCount: 11,
        }
      ]
    }
  ],
  settings: {
    weightedVoting: false,
    ballotReceipt: true,
    submitBallotConfirmation: true,
    submitBallotConfirmationMessage: 'Are you sure you want to submit your ballot? Your choice will be securely encrypted.',
    loginInstructions: 'Please provide your voter ID and voter key that you received from Election Commission in order to cast your vote.',
    voteConfirmationMessage: 'Thank you for taking your time to vote for Vision Lamka Election 2022!',
    afterElectionMessage: 'Voting for Vision Lamka Election 2022 has closed! Please contact your election administrator if you have any questions.',
    enableEmail: true,
    automaticVoterLogin: true,
    emailFromName: 'EC-VL Election 2022',
    emailSubject: 'You are invited to vote in the election: Vision Lamka Election 2022',
    emailBodyTemplate: 'Dear %name%,\n\nAs an esteemed member of Vision Lamka, you are invited to vote for the Managing Committee Election for the term 2022 to 2025 using the details below.\n\nPlease note that voting is open from 29th June 2022, 2:00PM till 1st July 2022, 4:00 PM.\n\nSd/-\nThangzamuan Hauzel\nElection Commissioner, VL Election 2022',
    emailReminderSubject: 'Voting Reminder: Vision Lamka Election 2022',
    emailReminderBodyTemplate: 'Dear %name%,\n\nThis is a friendly reminder to cast your vote for the Vision Lamka Managing Committee Election before the deadline.\n\nYour Voter ID: %voter_id%\nYour Voter Key: %voter_key%',
    hideResultsDuringElection: false,
    allowDuplicateWriteIn: false,
    isResultsPublished: true,
  }
};

export const initialVoters: Voter[] = [
  {
    id: 'vtr-1',
    voterId: 'VOTER-1001',
    voterKey: 'K98X2A4P',
    name: 'Thangzamuan Hauzel',
    email: 'thangzamuan@example.com',
    weight: 1,
    hasVoted: true,
    votedAt: '2022-06-29T14:15:22.000Z',
    ipAddress: '157.32.18.91'
  },
  {
    id: 'vtr-2',
    voterId: 'VOTER-1002',
    voterKey: 'M73P9L2W',
    name: 'Mary Kom Simte',
    email: 'mary.simte@example.com',
    weight: 1,
    hasVoted: true,
    votedAt: '2022-06-29T15:40:10.000Z',
    ipAddress: '157.32.18.92'
  },
  {
    id: 'vtr-3',
    voterId: 'VOTER-1003',
    voterKey: 'R44Q1V8Z',
    name: 'Francis Gangte',
    email: 'fgangte@example.com',
    weight: 1,
    hasVoted: true,
    votedAt: '2022-06-30T09:12:05.000Z',
    ipAddress: '110.224.45.12'
  },
  {
    id: 'vtr-4',
    voterId: 'VOTER-1004',
    voterKey: 'T81L4X9B',
    name: 'Grace Chingnem',
    email: 'grace.c@example.com',
    weight: 1,
    hasVoted: false,
  },
  {
    id: 'vtr-5',
    voterId: 'VOTER-1005',
    voterKey: 'H22N6K3Y',
    name: 'Samuel Vaiphei',
    email: 's.vaiphei@example.com',
    weight: 1,
    hasVoted: false,
  },
  {
    id: 'vtr-6',
    voterId: 'VOTER-1006',
    voterKey: 'P90W3J7E',
    name: 'Jennifer Neihsial',
    email: 'jennifer.n@example.com',
    weight: 1,
    hasVoted: true,
    votedAt: '2022-06-30T16:20:00.000Z',
    ipAddress: '157.32.18.91'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2022-06-29T14:15:22.000Z',
    voterId: 'VOTER-1001',
    action: 'Ballot Submitted Successfully',
    ipAddress: '157.32.18.91',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/103.0',
    status: 'SUCCESS',
    notes: 'Single vote verified with cryptographic key K98X2A4P'
  },
  {
    id: 'log-2',
    timestamp: '2022-06-29T14:18:05.000Z',
    voterId: 'VOTER-1001',
    action: 'Duplicate Access Attempt Blocked',
    ipAddress: '157.32.18.91',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/103.0',
    status: 'BLOCKED',
    notes: 'Voter key K98X2A4P already marked as cast. Subsequent vote rejected.'
  },
  {
    id: 'log-3',
    timestamp: '2022-06-29T15:40:10.000Z',
    voterId: 'VOTER-1002',
    action: 'Ballot Submitted Successfully',
    ipAddress: '157.32.18.92',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) Safari/604.1',
    status: 'SUCCESS',
    notes: 'Mobile voter submission authenticated'
  },
  {
    id: 'log-4',
    timestamp: '2022-06-30T09:12:05.000Z',
    voterId: 'VOTER-1003',
    action: 'Ballot Submitted Successfully',
    ipAddress: '110.224.45.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    notes: 'Ballot receipt generated #RCP-902148'
  },
  {
    id: 'log-5',
    timestamp: '2022-06-30T16:20:00.000Z',
    voterId: 'VOTER-1006',
    action: 'IP Multi-Vote Flagged (Notice)',
    ipAddress: '157.32.18.91',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/103.0',
    status: 'FLAGGED',
    notes: 'Second distinct voter (VOTER-1006) shared IP 157.32.18.91 with VOTER-1001. Flagged for review.'
  }
];
