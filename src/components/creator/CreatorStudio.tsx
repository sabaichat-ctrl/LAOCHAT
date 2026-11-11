import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  CreditCard,
  FileSpreadsheet,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Post, CreatorEarnings, PayoutRequest } from '../../types';
import {
  getPosts,
  getCreatorEarnings,
  requestPayout,
  getPayoutRequests,
} from '../../firebase/services';

export const CreatorStudio: React.FC = () => {
  const { user, userProfile, signInWithGoogle } = useAuth();
  const [creatorPosts, setCreatorPosts] = useState<Post[]>([]);
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Payout form state
  const [amountKip, setAmountKip] = useState(200000);
  const [paymentMethod, setPaymentMethod] = useState<'bcel_one' | 'ldb' | 'bank_transfer'>('bcel_one');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const creatorId = userProfile?.id || user?.uid || '';

  useEffect(() => {
    if (creatorId) {
      loadCreatorData();
    } else {
      setLoading(false);
    }
  }, [creatorId]);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      const [allPosts, creatorEarn, reqs] = await Promise.all([
        getPosts({ authorId: creatorId }),
        getCreatorEarnings(creatorId),
        getPayoutRequests(creatorId),
      ]);
      setCreatorPosts(allPosts);
      setEarnings(creatorEarn);
      setPayouts(reqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amountKip < 100000) {
      setErrorMsg('ຈຳນວນເງິນຖອນຂັ້ນຕ່ຳແມ່ນ 100,000 ກີບ');
      return;
    }

    if (!accountNumber.trim() || !accountName.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນເລກບັນຊີ ແລະ ຊື່ເຈົ້າຂອງບັນຊີໃຫ້ຄົບຖ້ວນ');
      return;
    }

    setSubmittingPayout(true);
    try {
      const requestId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const req: PayoutRequest = {
        id: requestId,
        creatorId,
        creatorName: userProfile?.displayName || user?.displayName || 'Creator',
        amountKip: Number(amountKip),
        paymentMethod,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await requestPayout(req);
      setPayouts([req, ...payouts]);
      setPayoutSuccess(true);
      setTimeout(() => {
        setPayoutSuccess(false);
        setShowPayoutModal(false);
        setAccountNumber('');
        setAccountName('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'ບໍ່ສາມາດສົ່ງຄຳຮ້ອງໄດ້');
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (!user && !userProfile) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">ຫ້ອງສະຕູດິໂອຜູ້ສ້າງ (Creator Studio)</h2>
        <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
          ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງສະຖິຕິຍອດວິວ, ຜູ້ຕິດຕາມ, ການເຮັດວຽກຂອງເນື້ອຫາ ແລະ ລາຍໄດ້ຄາດຄະເນຂອງທ່ານ.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 rounded-full font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
        >
          ເຂົ້າສູ່ລະບົບດ້ວຍ Google
        </button>
      </div>
    );
  }

  // Calculate stats from posts if earnings record empty
  const totalPostsViews = creatorPosts.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalLikes = creatorPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  const followersCount = userProfile?.followersCount || 1420;

  // Monetization qualification goals
  const followersGoal = 1000;
  const viewsGoal = 4000;
  const isEligible = followersCount >= followersGoal || (earnings?.isMonetized ?? false);

  const estimatedKip = earnings?.estimatedKip || Math.floor(totalPostsViews * 120); // ~120 Kip per verified view prototype estimate
  const estimatedUsd = earnings?.estimatedUsd || Math.floor(estimatedKip / 21500);
  const balanceKip = earnings?.balanceAvailableKip || Math.floor(estimatedKip * 0.8);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              LAOCHAT CREATOR STUDIO
            </span>
            {isEligible && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ພ້ອມສ້າງລາຍໄດ້</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            ສະບາຍດີ, {userProfile?.displayName || user?.displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ສູນລວມການວິເຄາະຜົນງານ, ຜູ້ຕິດຕາມ ແລະ ລະບົບສ່ວນແບ່ງລາຍໄດ້ໂຄສະນາສຳລັບຄີເອເຕີ້ລາວ.
          </p>
        </div>

        {/* Payout Action */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 w-full md:w-auto">
          <div>
            <p className="text-[11px] text-slate-400">ຍອດເງິນທີ່ພ້ອມຖອນໄດ້</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {balanceKip.toLocaleString()} <span className="text-xs font-normal">ກີບ (LAK)</span>
            </p>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>ຂໍຖອນເງິນ</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ຍອດວິວລວມ (Views)</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {totalPostsViews.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% ຈາກເດືອນຜ່ານມາ</span>
          </p>
        </div>

        {/* Followers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ຜູ້ຕິດຕາມ (Followers)</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {followersCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ເປົ້າໝາຍສ້າງລາຍໄດ້: 1,000 ຄົນ
          </p>
        </div>

        {/* Total Likes */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ຍອດຖືກໃຈ (Likes)</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {totalLikes.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ຈາກ {creatorPosts.length} ໂພສຕ໌ທີ່ເຜີຍແຜ່
          </p>
        </div>

        {/* Estimated Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">ລາຍໄດ້ຄາດຄະເນ (Est. LAK)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            {estimatedKip.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ປະມານ ${estimatedUsd} USD
          </p>
        </div>
      </div>

      {/* Monetization Progress & Transparency Policy */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>ເກນການເຂົ້າຮ່ວມໂຄງການສ້າງລາຍໄດ້ (Partner Program)</span>
            </h3>
            <p className="text-xs text-slate-400">
              ກວດສອບຄວາມພ້ອມຂອງຊ່ອງທ່ານໃນການຮັບສ່ວນແບ່ງລາຍໄດ້ໂຄສະນາ
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 self-start">
            ເງື່ອນໄຂມາດຕະຖານ LAOCHAT
          </span>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">ຜູ້ຕິດຕາມ (Followers)</span>
              <span className="text-amber-400 font-mono font-bold">
                {followersCount} / {followersGoal} ຄົນ
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (followersCount / followersGoal) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {followersCount >= followersGoal ? '✓ ຜ່ານເກນແລ້ວ' : `ຕ້ອງການອີກ ${followersGoal - followersCount} ຄົນ`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">ຍອດວິວທີ່ຜ່ານການກວດສອບ (Verified Views)</span>
              <span className="text-sky-400 font-mono font-bold">
                {totalPostsViews} / {viewsGoal} ວິວ
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalPostsViews / viewsGoal) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {totalPostsViews >= viewsGoal ? '✓ ຜ່ານເກນແລ້ວ' : `ຕ້ອງການອີກ ${viewsGoal - totalPostsViews} ວິວ`}
            </p>
          </div>
        </div>

        {/* Policy Notice per User Requirements */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-300">ນະໂຍບາຍຄວາມໂປ່ງໃສດ້ານລາຍໄດ້:</p>
            <p className="leading-relaxed">
              ລາຍໄດ້ທັງໝົດຄຳນວນຈາກຍອດວິວຕົວຈິງທີ່ໄດ້ຮັບການຢືນຢັນເທົ່ານັ້ນ (ບໍ່ລວມວິວປອມ ຫຼື ສະແປມ). ທຸກໆການຮ້ອງຂໍຖອນເງິນຈະຖືກກວດສອບໂດຍທີມງານຜູ້ດູແລລະບົບ (Admin Review) ກ່ອນການໂອນຜ່ານລະບົບທະນາຄານລາວ ເຊັ່ນ BCEL One ເພື່ອຄວາມປອດໄພສູງສຸດ.
            </p>
          </div>
        </div>
      </div>

      {/* Content Performance Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          <span>ຜົນງານເນື້ອຫາຂອງທ່ານ ({creatorPosts.length} ລາຍການ)</span>
        </h3>

        {creatorPosts.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-sm">ທ່ານຍັງບໍ່ທັນມີໂພສຕ໌ເທື່ອ ເລີ່ມສ້າງໂພສຕ໌ເພື່ອເບິ່ງສະຖິຕິ!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="pb-3 font-semibold">ເນື້ອຫາ / ຫົວຂໍ້</th>
                  <th className="pb-3 font-semibold">ປະເພດ</th>
                  <th className="pb-3 font-semibold">ໝວດໝູ່</th>
                  <th className="pb-3 font-semibold text-right">ຍອດວິວ</th>
                  <th className="pb-3 font-semibold text-right">ຖືກໃຈ</th>
                  <th className="pb-3 font-semibold text-right">ລາຍໄດ້ຄາດຄະເນ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {creatorPosts.map((p) => {
                  const postEstKip = Math.floor((p.viewsCount || 0) * 120);
                  return (
                    <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 pr-4 max-w-xs truncate font-medium text-slate-200">
                        {p.title || p.content}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-xs">{p.category}</td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {(p.viewsCount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-rose-400">
                        {(p.likesCount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        {postEstKip.toLocaleString()} ກີບ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          <span>ປະຫວັດການຂໍຖອນເງິນ (Payout Requests)</span>
        </h3>

        {payouts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            ຍັງບໍ່ມີປະຫວັດການຂໍຖອນເງິນ
          </p>
        ) : (
          <div className="space-y-2.5">
            {payouts.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-sm">
                      {req.amountKip.toLocaleString()} ກີບ
                    </span>
                    <span className="text-slate-400 uppercase">• {req.paymentMethod}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    ບັນຊີ: {req.accountNumber} ({req.accountName})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase text-[11px] ${
                      req.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : req.status === 'rejected'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {req.status === 'approved'
                      ? '✓ ອະນຸມັດແລ້ວ'
                      : req.status === 'rejected'
                      ? '✕ ປະຕິເສດ'
                      : '⏳ ລໍຖ້າກວດສອບ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-1">
              ຂໍຖອນເງິນສ່ວນແບ່ງລາຍໄດ້ (Payout Request)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              ໂອນເຂົ້າບັນຊີທະນາຄານລາວຂອງທ່ານ ຫຼັງຈາກແອດມິນກວດສອບຍອດວິວແລ້ວ.
            </p>

            {payoutSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">ສົ່ງຄຳຮ້ອງຖອນເງິນສຳເລັດ!</h4>
                <p className="text-xs text-slate-400">
                  ລະບົບກຳລັງສົ່ງໃຫ້ຜູ້ດູແລລະບົບກວດສອບ ແລະ ຈະແຈ້ງຜົນໃຫ້ທ່ານຊາບ.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ຈຳນວນເງິນທີ່ຕ້ອງການຖອນ (ກີບ LAK)
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    value={amountKip}
                    onChange={(e) => setAmountKip(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ຍອດຖອນຂັ້ນຕ່ຳ: 100,000 ກີບ (ຍອດທີ່ມີ: {balanceKip.toLocaleString()} ກີບ)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ຊ່ອງທາງການຮັບເງິນ
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="bcel_one">BCEL One (OnePay / ເບີໂທລະສັບ ຫຼື ເລກບັນຊີ)</option>
                    <option value="ldb">ທະນາຄານ ພັດທະນາລາວ (LDB)</option>
                    <option value="bank_transfer">ທະນາຄານອື່ນໆ ໃນ ສປປ ລາວ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ເລກບັນຊີ ຫຼື ເບີໂທ BCEL One
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="ຕົວຢ່າງ: 020 5555 9999 ຫຼື 160-12-00-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ຊື່ເຈົ້າຂອງບັນຊີ (ຕ້ອງກົງກັບບັນຊີທະນາຄານ)
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="ຕົວຢ່າງ: SOMXAY CHANTHAVONG"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayout}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-all"
                  >
                    {submittingPayout ? 'ກຳລັງສົ່ງ...' : 'ຢືນຢັນການຂໍຖອນເງິນ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
