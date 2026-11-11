import React, { useEffect } from 'react';
import { ExternalLink, Sparkles, Megaphone } from 'lucide-react';
import { Advertisement } from '../../types';
import { trackAdImpression, trackAdClick } from '../../firebase/services';

interface SponsoredAdCardProps {
  ad: Advertisement;
}

export const SponsoredAdCard: React.FC<SponsoredAdCardProps> = ({ ad }) => {
  useEffect(() => {
    trackAdImpression(ad.id);
  }, [ad.id]);

  const handleClick = () => {
    trackAdClick(ad.id);
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl hover:border-amber-500/50 transition-all group">
      {/* Sponsor Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3">
          {ad.brandLogo ? (
            <img
              src={ad.brandLogo}
              alt={ad.brandName}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-amber-500/40 p-0.5 bg-slate-800"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Megaphone className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {ad.brandName}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>ໂຄສະນາຜູ້ສະໜັບສະໜູນ LAOCHAT</span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
          SPONSORED
        </span>
      </div>

      {/* Ad Media */}
      {ad.mediaUrl && (
        <div
          onClick={handleClick}
          className="relative aspect-video sm:aspect-[21/9] overflow-hidden cursor-pointer bg-slate-950"
        >
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>
      )}

      {/* Ad Content & CTA */}
      <div className="p-4 sm:p-5 space-y-3">
        <h3
          onClick={handleClick}
          className="text-base sm:text-lg font-bold text-slate-100 hover:text-amber-300 cursor-pointer transition-colors"
        >
          {ad.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {ad.description}
        </p>

        <div className="pt-2 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            ໂຄສະນານີ້ຊ່ວຍສະໜັບສະໜູນລາຍໄດ້ໃຫ້ຄີເອເຕີ້ລາວ
          </span>
          <button
            onClick={handleClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
          >
            <span>ເບິ່ງລາຍລະອຽດ</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
