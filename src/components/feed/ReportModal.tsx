import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Post, ContentReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { submitReport } from '../../firebase/services';

interface ReportModalProps {
  post: Post | null;
  onClose: () => void;
}

const REPORT_REASONS = [
  'ເນື້ອຫາບໍ່ເໝາະສົມ ຫຼື ຂັດຕໍ່ວັດທະນະທຳລາວ',
  'ຂໍ້ມູນເທັດ ຫຼື ຂ່າວປອມ (Fake News)',
  'ການຫຼອກລວງ ຫຼື ສະແປມ (Scam / Spam)',
  'ການລະເມີດລິຂະສິດຜົນງານ (Copyright)',
  'ການຄຸກຄາມ ຫຼື ໃຊ້ຄຳເວົ້າຮຸນແຮງ (Harassment)',
  'ອື່ນໆ',
];

export const ReportModal: React.FC<ReportModalProps> = ({ post, onClose }) => {
  const { user, userProfile, signInWithGoogle } = useAuth();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !userProfile) {
      signInWithGoogle();
      return;
    }

    setLoading(true);
    try {
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const report: ContentReport = {
        id: reportId,
        postId: post.id,
        postTitle: post.title || post.content.slice(0, 50),
        reporterId: userProfile?.id || user?.uid || 'user',
        reason: `${reason}${details ? ' - ' + details : ''}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await submitReport(report);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
      alert('ບໍ່ສາມາດສົ່ງລາຍງານໄດ້ ກະລຸນາລອງໃໝ່');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">ສົ່ງລາຍງານສຳເລັດແລ້ວ</h3>
            <p className="text-xs text-slate-300">
              ທີມງານຜູ້ດູແລລະບົບ LAOCHAT ຈະກວດສອບເນື້ອຫານີ້ຢ່າງເຂັ້ມງວດ.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ລາຍງານເນື້ອຫາບໍ່ເໝາະສົມ</h3>
                <p className="text-xs text-slate-400">ຊ່ວຍຮັກສາໃຫ້ LAOCHAT ເປັນພື້ນທີ່ປອດໄພ</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 truncate">
              <span className="font-bold text-slate-400">ໂພສຕ໌:</span> {post.title || post.content}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ສາເຫດການລາຍງານ
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ລາຍລະອຽດເພີ່ມເຕີມ (ຖ້າມີ)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="ອະທິບາຍເພີ່ມເຕີມເພື່ອຊ່ວຍໃນການກວດສອບ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                ຍົກເລີກ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition-all disabled:opacity-50"
              >
                {loading ? 'ກຳລັງສົ່ງ...' : 'ສົ່ງລາຍງານ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
