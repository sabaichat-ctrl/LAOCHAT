import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  DollarSign,
  Megaphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  RefreshCw,
  Plus,
  ExternalLink,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllUsers,
  getReports,
  updateReportStatus,
  getPayoutRequests,
  updatePayoutStatus,
  getAdvertisements,
  saveAdvertisement,
  setCreatorVerified,
  seedDemoData,
  getPosts,
} from '../../firebase/services';
import {
  UserProfile,
  ContentReport,
  PayoutRequest,
  Advertisement,
  Post,
} from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'payouts' | 'ads' | 'users'>('overview');

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Ad Form Modal
  const [showAddAdModal, setShowAddAdModal] = useState(false);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdBrand, setNewAdBrand] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdMedia, setNewAdMedia] = useState('');
  const [newAdTarget, setNewAdTarget] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [uList, rList, pList, aList, postList] = await Promise.all([
        getAllUsers(),
        getReports(),
        getPayoutRequests(),
        getAdvertisements(),
        getPosts(),
      ]);
      setUsers(uList);
      setReports(rList);
      setPayouts(pList);
      setAds(aList);
      setPosts(postList);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleResolveReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    try {
      await updateReportStatus(reportId, status);
      setReports(reports.map((r) => (r.id === reportId ? { ...r, status } : r)));
      showNotification(status === 'reviewed' ? 'ດຳເນີນການກວດສອບເນື້ອຫາແລ້ວ' : 'ຍົກເລີກລາຍງານແລ້ວ');
    } catch (e) {
      alert('ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleReviewPayout = async (
    requestId: string,
    status: 'approved' | 'rejected',
    note?: string
  ) => {
    try {
      await updatePayoutStatus(requestId, status, note || 'ກວດສອບຜ່ານລະບົບແອດມິນ');
      setPayouts(
        payouts.map((p) =>
          p.id === requestId
            ? { ...p, status, reviewedAt: new Date().toISOString() }
            : p
        )
      );
      showNotification(status === 'approved' ? 'ອະນຸມັດການຖອນເງິນແລ້ວ' : 'ປະຕິເສດການຖອນເງິນແລ້ວ');
    } catch (e) {
      alert('ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleToggleVerified = async (userId: string, currentStatus: boolean) => {
    try {
      await setCreatorVerified(userId, !currentStatus);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, isVerifiedCreator: !currentStatus } : u
        )
      );
      showNotification('ອັບເດດກາຢັ້ງຢືນຄີເອເຕີ້ສຳເລັດ');
    } catch (e) {
      alert('ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdBrand) return;

    try {
      const adId = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const ad: Advertisement = {
        id: adId,
        title: newAdTitle,
        brandName: newAdBrand,
        description: newAdDesc,
        mediaUrl: newAdMedia || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80',
        targetUrl: newAdTarget || 'https://laochat.la',
        status: 'active',
        impressionsCount: 0,
        clicksCount: 0,
        createdAt: new Date().toISOString(),
      };

      await saveAdvertisement(ad);
      setAds([...ads, ad]);
      setShowAddAdModal(false);
      setNewAdTitle('');
      setNewAdBrand('');
      setNewAdDesc('');
      setNewAdMedia('');
      setNewAdTarget('');
      showNotification('ສ້າງແຄມເປນໂຄສະນາໃໝ່ສຳເລັດແລ້ວ');
    } catch (e) {
      alert('ບໍ່ສາມາດບັນທຶກໂຄສະນາໄດ້');
    }
  };

  const handleSeedData = async () => {
    if (!confirm('ທ່ານຕ້ອງການໂຫຼດເນື້ອຫາ ແລະ ໂຄສະນາຕົວຢ່າງລາວລົງໃນຖານຂໍ້ມູນແທ້ບໍ?')) return;
    try {
      await seedDemoData();
      await loadAllData();
      showNotification('ໂຫຼດຂໍ້ມູນຕົວຢ່າງລົງ Firestore ສຳເລັດແລ້ວ!');
    } catch (e) {
      alert('ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຕົວຢ່າງໄດ້');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <Shield className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">ສະຫງວນສິດສະເພາະຜູ້ດູແລລະບົບ (Admin Only)</h2>
        <p className="text-xs text-slate-400">
          ບັນຊີຂອງທ່ານ ({user?.email || 'Guest'}) ບໍ່ມີສິດໃນການເຂົ້າເຖິງໜ້ານີ້.
        </p>
      </div>
    );
  }

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl text-center shadow-lg animate-in fade-in">
          {actionSuccessMsg}
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">
                ກະດານຄວບຄຸມແອດມິນ (Admin Center)
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                LaoChat System
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ຈັດການຜູ້ໃຊ້ງານ, ກວດສອບເນື້ອຫາ, ອະນຸມັດການຖອນເງິນ ແລະ ແຄມເປນໂຄສະນາ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
            title="ໂຫຼດຂໍ້ມູນຕົວຢ່າງຖ້າຖານຂໍ້ມູນວ່າງ"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>ໂຫຼດຂໍ້ມູນຕົວຢ່າງ</span>
          </button>

          <button
            onClick={loadAllData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="ຣີເຟຣຊ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ພາບລວມລະບົບ
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'payouts'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>ອະນຸມັດຖອນເງິນ</span>
          {pendingPayouts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
              {pendingPayouts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'moderation'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>ກວດສອບເນື້ອຫາ & ລາຍງານ</span>
          {pendingReports.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingReports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'ads'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ຈັດການໂຄສະນາ ({ads.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ຈັດການຜູ້ໃຊ້ ({users.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">ຜູ້ໃຊ້ງານທັງໝົດ</span>
              <p className="text-2xl sm:text-3xl font-bold text-white font-mono">{users.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">ໂພສຕ໌ທັງໝົດ</span>
              <p className="text-2xl sm:text-3xl font-bold text-white font-mono">{posts.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">ລາຍການຖອນເງິນທີ່ລໍຖ້າ</span>
              <p className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
                {pendingPayouts.length}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">ລາຍງານທີ່ລໍຖ້າກວດ</span>
              <p className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono">
                {pendingReports.length}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">ສະຖານະການເຊື່ອມຕໍ່ລະບົບ Cloud Firestore</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ຖານຂໍ້ມູນ (Database ID)</span>
                  <span className="font-mono text-emerald-400">ai-studio-ffad9d6d-...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ກົດຄວາມປອດໄພ (Firestore Rules)</span>
                  <span className="font-bold text-emerald-400">✓ DEPLOYED & HARDENED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ລະບົບຢືນຢັນຕົວຕົນ (Auth)</span>
                  <span className="font-bold text-emerald-400">✓ Firebase Auth Google</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ການປົກປ້ອງລາຍໄດ້ຄີເອເຕີ້</span>
                  <span className="text-amber-400">Server-Authoritative Only</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ການໂອນເງິນຕົວຈິງ</span>
                  <span className="text-slate-400">ປິດໄວ້ (Simulation Safe Mode)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Payouts Approval */}
      {activeTab === 'payouts' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white">
              ກວດສອບ ແລະ ອະນຸມັດການຖອນລາຍໄດ້ ({payouts.length} ລາຍການ)
            </h3>
            <span className="text-xs text-amber-400 font-semibold">
              * ຕ້ອງກວດສອບຍອດວິວຕົວຈິງກ່ອນອະນຸມັດ
            </span>
          </div>

          {payouts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">ບໍ່ມີຄຳຮ້ອງຂໍຖອນເງິນ</p>
          ) : (
            <div className="space-y-3">
              {payouts.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {req.creatorName}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold text-base">
                        {req.amountKip.toLocaleString()} ກີບ
                      </span>
                      <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {req.paymentMethod}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      ເລກບັນຊີ: <span className="font-mono text-slate-200">{req.accountNumber}</span> | ຊື່: <span className="text-slate-200">{req.accountName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleReviewPayout(req.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ອະນຸມັດ</span>
                        </button>
                        <button
                          onClick={() => handleReviewPayout(req.id, 'rejected')}
                          className="px-3.5 py-1.5 rounded-xl font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ປະຕິເສດ</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full font-bold uppercase text-[11px] ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {req.status === 'approved' ? '✓ ອະນຸມັດແລ້ວ' : '✕ ປະຕິເສດແລ້ວ'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Moderation */}
      {activeTab === 'moderation' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white">
            ລາຍງານເນື້ອຫາບໍ່ເໝາະສົມ ({reports.length})
          </h3>

          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">ບໍ່ມີເນື້ອຫາທີ່ຖືກລາຍງານ</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400">ສາເຫດ: {rep.reason}</span>
                      <span className="text-slate-400">• ID: {rep.postId}</span>
                    </div>
                    <p className="text-slate-300">ຫົວຂໍ້: {rep.postTitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'reviewed')}
                          className="px-3 py-1.5 rounded-xl font-bold bg-amber-500 text-slate-950"
                        >
                          ຈັດການແລ້ວ
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-slate-400"
                        >
                          ຍົກເລີກ
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full font-bold bg-slate-800 text-slate-400 uppercase text-[11px]">
                        {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Advertisements */}
      {activeTab === 'ads' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                ຈັດການແຄມເປນໂຄສະນາຜູ້ສະໜັບສະໜູນ
              </h3>
              <p className="text-xs text-slate-400">ໂຄສະນາທີ່ສ້າງລາຍໄດ້ໃຫ້ແກ່ຄີເອເຕີ້ໃນ LAOCHAT</p>
            </div>
            <button
              onClick={() => setShowAddAdModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມແຄມເປນໃໝ່</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{ad.brandName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    {ad.status}
                  </span>
                </div>
                <p className="text-slate-300 font-semibold">{ad.title}</p>
                <p className="text-slate-400">{ad.description}</p>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                  <span>{ad.impressionsCount.toLocaleString()} impressions</span>
                  <span>{ad.clicksCount.toLocaleString()} clicks</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Ad Modal */}
          {showAddAdModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <h4 className="text-base font-bold text-white mb-3">ສ້າງແຄມເປນໂຄສະນາໃໝ່</h4>
                <form onSubmit={handleCreateAd} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">ຊື່ແບຣນ / ຜູ້ສະໜັບສະໜູນ</label>
                    <input
                      type="text"
                      value={newAdBrand}
                      onChange={(e) => setNewAdBrand(e.target.value)}
                      placeholder="ເຊັ່ນ: BCEL One, Dao Coffee..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">ຫົວຂໍ້ໂຄສະນາ (Headline)</label>
                    <input
                      type="text"
                      value={newAdTitle}
                      onChange={(e) => setNewAdTitle(e.target.value)}
                      placeholder="ເຊັ່ນ: ແອັບທະນາຄານທີ່ໄວທີ່ສຸດ..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">ຄຳອະທິບາຍ (Ad Copy)</label>
                    <textarea
                      rows={2}
                      value={newAdDesc}
                      onChange={(e) => setNewAdDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">URL ຮູບພາບໂຄສະນາ</label>
                    <input
                      type="text"
                      value={newAdMedia}
                      onChange={(e) => setNewAdMedia(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">URL ປາຍທາງ (Target Link)</label>
                    <input
                      type="text"
                      value={newAdTarget}
                      onChange={(e) => setNewAdTarget(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAdModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400"
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950"
                    >
                      ບັນທຶກ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: User Management */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white">
            ລາຍຊື່ຜູ້ໃຊ້ງານ & ຄີເອເຕີ້ ({users.length})
          </h3>

          <div className="divide-y divide-slate-800">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.id}
                    alt={u.displayName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{u.displayName}</span>
                      {u.isVerifiedCreator && (
                        <span title="ຢືນຢັນແລ້ວ">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">@{u.handle} • {u.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVerified(u.id, u.isVerifiedCreator)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                      u.isVerifiedCreator
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {u.isVerifiedCreator ? '✓ ກາຢັ້ງຢືນແລ້ວ' : '+ ມອບກາຢັ້ງຢືນ'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
