import React, { useState } from 'react';
import {
  Vote,
  Plus,
  Eye,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  UserCheck,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { Election, CandidateOption, BallotQuestion, UserProfile, AdminTierConfig } from '../types';

interface BallotTabProps {
  election: Election;
  onUpdateElection: (data: Partial<Election>) => Promise<void>;
  currentUser?: UserProfile;
  tierConfig?: AdminTierConfig;
  onOpenPaymentModal?: () => void;
}

export const BallotTab: React.FC<BallotTabProps> = ({
  election,
  onUpdateElection,
  currentUser,
  tierConfig,
  onOpenPaymentModal
}) => {
  const mainQuestion = election.questions[0];

  const [questionText, setQuestionText] = useState(mainQuestion?.question || '');
  const [descriptionText, setDescriptionText] = useState(mainQuestion?.description || '');
  const [maxSelections, setMaxSelections] = useState(mainQuestion?.maxSelections || 9);

  // Candidate detail popup modal
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOption | null>(null);

  // Free Tier Alert Modal
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  // Add/Edit Candidate Modal
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [candTitle, setCandTitle] = useState('');
  const [candShortDesc, setCandShortDesc] = useState('');
  const [candFullDesc, setCandFullDesc] = useState('');
  const [candPhoto, setCandPhoto] = useState('');

  const maxFreeCandidates = tierConfig?.freeMaxCandidates || 10;
  const currentOptionsCount = mainQuestion?.options.length || 0;

  const handleSaveQuestionSettings = async () => {
    const updatedQuestions: BallotQuestion[] = [
      {
        ...mainQuestion,
        question: questionText,
        description: descriptionText,
        maxSelections: Number(maxSelections),
        options: mainQuestion.options
      }
    ];
    await onUpdateElection({ questions: updatedQuestions });
  };

  const handleOpenAddCandidate = () => {
    // Free Tier Candidate Limit Enforcement (e.g. 10 max)
    if (
      currentUser?.role === 'ORGANIZER' &&
      currentUser?.plan === 'FREE' &&
      currentOptionsCount >= maxFreeCandidates
    ) {
      setShowLimitAlert(true);
      return;
    }

    setEditingOptionId(null);
    setCandTitle('');
    setCandShortDesc('');
    setCandFullDesc('');
    setCandPhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    setIsCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (opt: CandidateOption) => {
    setEditingOptionId(opt.id);
    setCandTitle(opt.title);
    setCandShortDesc(opt.shortDescription);
    setCandFullDesc(opt.description);
    setCandPhoto(opt.photoUrl || '');
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    let currentOptions = [...mainQuestion.options];

    if (editingOptionId) {
      currentOptions = currentOptions.map(o =>
        o.id === editingOptionId
          ? {
              ...o,
              title: candTitle,
              shortDescription: candShortDesc,
              description: candFullDesc,
              photoUrl: candPhoto
            }
          : o
      );
    } else {
      const newOpt: CandidateOption = {
        id: `opt-${Date.now()}`,
        title: candTitle,
        shortDescription: candShortDesc,
        description: candFullDesc,
        photoUrl: candPhoto,
        votesCount: 0
      };
      currentOptions.push(newOpt);
    }

    const updatedQuestions: BallotQuestion[] = [
      {
        ...mainQuestion,
        options: currentOptions
      }
    ];

    await onUpdateElection({ questions: updatedQuestions });
    setIsCandidateModalOpen(false);
  };

  const handleDeleteCandidate = async (optId: string) => {
    const updatedOptions = mainQuestion.options.filter(o => o.id !== optId);
    const updatedQuestions: BallotQuestion[] = [
      {
        ...mainQuestion,
        options: updatedOptions
      }
    ];
    await onUpdateElection({ questions: updatedQuestions });
  };

  return (
    <div className="space-y-6">
      
      {/* Ballot Header & Question Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Vote className="w-5 h-5 text-indigo-600" />
              Ballot Question & Candidates Builder
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure ballot instructions, max allowed candidate picks, and option profiles
            </p>
          </div>

          <button
            id="ballot-btn-add-candidate"
            onClick={handleOpenAddCandidate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Candidate Option
          </button>
        </div>

        {/* Form to update Question Title & Max Choices */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          <div className="md:col-span-8">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Ballot Question / Position Title</label>
            <input
              type="text"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-slate-700 block mb-1">Max Selections Allowed</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={maxSelections}
                onChange={e => setMaxSelections(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
              <button
                onClick={handleSaveQuestionSettings}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shrink-0"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Options Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Candidate Options ({mainQuestion?.options.length || 0})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainQuestion?.options.map((opt, idx) => (
            <div
              key={opt.id}
              className="group bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={opt.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={opt.title}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-slate-900 truncate">{opt.title}</div>
                  <div className="text-[11px] font-semibold text-indigo-600 truncate mt-0.5">{opt.shortDescription}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{opt.description}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedCandidate(opt)}
                  className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditCandidate(opt)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(opt.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Option Details Modal (Matching screenshot 5 exact pop-up layout!) */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header bar */}
            <div className="bg-sky-500 px-5 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span>Option Details</span>
                <span className="bg-sky-600 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                  Standard Option
                </span>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 hover:bg-sky-600 rounded-lg text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Fields */}
            <div className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Question</label>
                <input
                  type="text"
                  readOnly
                  value={mainQuestion.question}
                  className="w-full bg-slate-100 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Title</label>
                  <input
                    type="text"
                    readOnly
                    value={selectedCandidate.title}
                    className="w-full bg-slate-100 text-slate-900 font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Photo Preview</label>
                  <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl">
                    <img
                      src={selectedCandidate.photoUrl}
                      alt={selectedCandidate.title}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="text-sky-700 font-semibold truncate">
                      {selectedCandidate.photoUrl ? 'Photo attached' : 'No photo provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Short Description</label>
                <input
                  type="text"
                  readOnly
                  value={selectedCandidate.shortDescription || 'No short description'}
                  className="w-full bg-slate-100 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block mb-1">Description / Bio</label>
                <div className="w-full bg-slate-50 text-slate-700 p-3 rounded-xl border border-slate-200 min-h-[70px]">
                  {selectedCandidate.description || 'No description provided.'}
                </div>
              </div>

            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-900"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add/Edit Candidate Form Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingOptionId ? 'Edit Candidate Option' : 'Add Candidate Option'}
              </h3>
              <button onClick={() => setIsCandidateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Candidate Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEKKHOMANG NEIHSIAL"
                  value={candTitle}
                  onChange={e => setCandTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Short Location / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. NEW DELHI"
                  value={candShortDesc}
                  onChange={e => setCandShortDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={candPhoto}
                  onChange={e => setCandPhoto(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Bio</label>
                <textarea
                  rows={3}
                  placeholder="Candidate biography, platform statement, or achievements..."
                  value={candFullDesc}
                  onChange={e => setCandFullDesc(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Free Plan Candidate Limit Alert Dialog */}
      {showLimitAlert && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Free Plan Limit Reached</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Free organizers are limited to setting up a maximum of <strong>{maxFreeCandidates} candidates</strong> per election.
                Upgrade to <strong>eTelna Premium</strong> for unlimited candidates and lifetime election tools!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowLimitAlert(false);
                  if (onOpenPaymentModal) onOpenPaymentModal();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium Now
              </button>

              <button
                onClick={() => setShowLimitAlert(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
