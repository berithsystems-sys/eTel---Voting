import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Vote,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import { Election, CandidateOption, Voter, BallotReceiptData } from '../types';
import { loginVoter, castVote } from '../services/api';

interface VoterPortalProps {
  election: Election;
  sampleVoters: Voter[];
  onBackToAdmin: () => void;
}

export const VoterPortal: React.FC<VoterPortalProps> = ({
  election,
  sampleVoters,
  onBackToAdmin
}) => {
  // Login State
  const [voterId, setVoterId] = useState('');
  const [voterKey, setVoterKey] = useState('');
  const [authenticatedVoter, setAuthenticatedVoter] = useState<Partial<Voter> | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Voting State
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<CandidateOption | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [voteSuccessReceipt, setVoteSuccessReceipt] = useState<BallotReceiptData | null>(null);

  const mainQuestion = election.questions[0];
  const maxAllowed = mainQuestion?.maxSelections || 9;

  // Auto fill sample voter for instant demo testing
  const handleSelectSampleVoter = (v: Voter) => {
    setVoterId(v.voterId);
    setVoterKey(v.voterKey);
    setLoginError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterId || !voterKey) return;
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await loginVoter(voterId.trim(), voterKey.trim());
      setAuthenticatedVoter(res.voter);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid Voter ID or Voter Key combination.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleToggleCandidate = (optId: string) => {
    if (selectedOptionIds.includes(optId)) {
      setSelectedOptionIds(selectedOptionIds.filter(id => id !== optId));
    } else {
      if (selectedOptionIds.length >= maxAllowed) {
        alert(`You can select a maximum of ${maxAllowed} options for this question.`);
        return;
      }
      setSelectedOptionIds([...selectedOptionIds, optId]);
    }
  };

  const handleCastVoteClick = () => {
    if (selectedOptionIds.length === 0) {
      alert('Please select at least one candidate option to cast your vote.');
      return;
    }
    if (election.settings.submitBallotConfirmation) {
      setShowConfirmModal(true);
    } else {
      executeVoteSubmission();
    }
  };

  const executeVoteSubmission = async () => {
    if (!authenticatedVoter?.voterId) return;
    setIsSubmittingVote(true);
    try {
      const res = await castVote({
        voterId: authenticatedVoter.voterId,
        voterKey: voterKey.trim(),
        selections: {
          [mainQuestion.id]: selectedOptionIds
        }
      });

      setVoteSuccessReceipt(res.receipt);
      setShowConfirmModal(false);

      // Trigger Confetti Burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore confetti errors
      }

    } catch (err: any) {
      alert(err.message || 'Failed to submit vote.');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleDownloadReceiptTxt = () => {
    if (!voteSuccessReceipt) return;
    const txt = `========== ELECTION BALLOT RECEIPT ==========
Election: ${voteSuccessReceipt.electionTitle}
Receipt ID: ${voteSuccessReceipt.receiptId}
Voter ID: ${voteSuccessReceipt.voterId}
Voted At: ${new Date(voteSuccessReceipt.votedAt).toLocaleString()}
Selections Count: ${voteSuccessReceipt.selectionCount}
Cryptographic Signature: ${voteSuccessReceipt.cryptographicSignature}
Status: Cryptographically Verified & Sealed
=================================================`;
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${voteSuccessReceipt.receiptId}.txt`;
    link.click();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Back to Admin bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToAdmin}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Switch to Admin Panel
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Public Voter Access Portal
          </span>
        </div>

        {/* ELECTION CLOSED BANNER IF COMPLETED */}
        {election.status === 'Completed' && !authenticatedVoter && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-800 text-xs font-medium flex items-center gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold block text-sm">Election Completed</strong>
              {election.settings.afterElectionMessage}
            </div>
          </div>
        )}

        {/* VOTE SUCCESS STATE */}
        {voteSuccessReceipt ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ballot Submitted Successfully!</h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                {election.settings.voteConfirmationMessage}
              </p>
            </div>

            {/* Cryptographic Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs font-mono space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between text-slate-500 font-sans border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Official Ballot Receipt
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">VERIFIED</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Receipt Number:</span>
                <span className="font-bold text-slate-900">{voteSuccessReceipt.receiptId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Voter ID:</span>
                <span className="font-bold text-slate-900">{voteSuccessReceipt.voterId}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Selections:</span>
                <span className="font-bold text-slate-900">{voteSuccessReceipt.selectionCount}</span>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 break-all">
                Hash: {voteSuccessReceipt.cryptographicSignature}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadReceiptTxt}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Download Official Ballot Receipt
              </button>
            </div>
          </div>
        ) : !authenticatedVoter ? (
          
          /* LOGIN STEP */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Vote className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{election.title}</h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
                {election.settings.loginInstructions}
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Voter ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your Voter ID (e.g., VOTER-1004)"
                  value={voterId}
                  onChange={e => setVoterId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Voter Key</label>
                <input
                  type="password"
                  required
                  placeholder="Enter your secret Voter Key"
                  value={voterKey}
                  onChange={e => setVoterKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                {isLoggingIn ? 'Authenticating...' : 'Authenticate & Access Ballot'}
              </button>
            </form>
          </div>
        ) : (

          /* BALLOT SELECTION STEP */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
            
            {/* Authenticated Voter Banner */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Authenticated Voter</span>
                <span className="font-black text-slate-900 text-sm">{authenticatedVoter.name}</span>
                <span className="text-slate-500 text-xs ml-2 font-mono">({authenticatedVoter.voterId})</span>
              </div>
              <button
                onClick={() => setAuthenticatedVoter(null)}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Log Out
              </button>
            </div>

            {/* Question Header & Counter */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-black text-slate-900">{mainQuestion.question}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shrink-0">
                  {selectedOptionIds.length} of {maxAllowed} selected
                </span>
              </div>
              <p className="text-xs text-slate-500">{mainQuestion.description}</p>
            </div>

            {/* Candidates Grid */}
            <div className="space-y-3">
              {mainQuestion.options.map(opt => {
                const isSelected = selectedOptionIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleCandidate(opt.id)}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={opt.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={opt.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">{opt.title}</div>
                        <div className="text-xs font-semibold text-indigo-600 truncate">{opt.shortDescription}</div>
                        <div className="text-xs text-slate-500 truncate max-w-sm mt-0.5">{opt.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidateDetail(opt);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors text-xs font-semibold"
                      >
                        Details
                      </button>

                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Double-check your choices before casting ballot.
              </span>
              <button
                onClick={handleCastVoteClick}
                disabled={isSubmittingVote || selectedOptionIds.length === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {isSubmittingVote ? 'Submitting Vote...' : 'Submit Ballot'}
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Persistent Voter Portal Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-slate-600 text-xs mt-12 w-full">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900">eTelna Online Voter Ballot</span>
            <span className="text-slate-400">•</span>
            <span>Cryptographic Verification</span>
          </div>

          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <span>Powered by:</span>
            <a
              href="https://BerithSystems.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-black text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>BerithSystems.com</span>
              <ExternalLink className="w-3 h-3 text-indigo-500" />
            </a>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-slate-900 text-base">Confirm Ballot Submission</h3>
              <p className="text-xs text-slate-600">
                {election.settings.submitBallotConfirmationMessage}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-left text-xs text-slate-700 font-semibold space-y-1">
                <div>Selected Candidates ({selectedOptionIds.length}):</div>
                <ul className="list-disc list-inside text-[11px] text-indigo-700 font-bold space-y-0.5">
                  {selectedOptionIds.map(id => {
                    const opt = mainQuestion.options.find(o => o.id === id);
                    return <li key={id}>{opt?.title}</li>;
                  })}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel & Review
              </button>
              <button
                onClick={executeVoteSubmission}
                disabled={isSubmittingVote}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidateDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Candidate Information</h3>
              <button onClick={() => setSelectedCandidateDetail(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <img
                src={selectedCandidateDetail.photoUrl}
                alt={selectedCandidateDetail.title}
                className="w-full h-40 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="font-black text-slate-900 text-sm">{selectedCandidateDetail.title}</div>
                <div className="text-indigo-600 font-bold mt-0.5">{selectedCandidateDetail.shortDescription}</div>
                <div className="text-slate-600 mt-2 leading-relaxed">{selectedCandidateDetail.description}</div>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
