import React, { useEffect } from 'react';
import { MapPin, Phone, Clock, User, X, Shield } from 'lucide-react';
import { MOCK_CSC_LIST } from '../data/mock-data';

interface CSCLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSCLocatorModal: React.FC<CSCLocatorModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#141416] text-[#F2F1EC] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(34,197,94,0.2)] border border-[rgba(34,197,94,0.25)] max-w-3xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[rgba(34,197,94,0.15)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <MapPin className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-[#F2F1EC]">
                  Nearest Common Service Centres (CSC) & Seva Kendras
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                  Verified Centers
                </span>
              </div>
              <p className="text-xs text-[#9A9A9E] font-medium mt-0.5">
                Authorized government physical assistance centers for in-person document attestation & biometric submission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8ABB3] hover:text-[#F2F1EC] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {MOCK_CSC_LIST.map((csc) => (
            <div
              key={csc.id}
              className="bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-xl p-4 hover:border-[#22C55E] transition-all space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#F2F1EC] flex items-center gap-2">
                    {csc.name}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {csc.distanceKm} km away
                    </span>
                  </h4>
                  <p className="text-xs text-[#A8ABB3] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    {csc.address}, {csc.district} - {csc.pincode}
                  </p>
                </div>
                <a
                  href={`tel:${csc.contactNumber}`}
                  className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#22C55E] text-[#0A0A0B] text-xs font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Centre</span>
                </a>
              </div>

              <div className="pt-2 border-t border-[rgba(34,197,94,0.15)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#9A9A9E]">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>VLE Operator: <strong className="text-[#F2F1EC]">{csc.operatorName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Hours: <strong className="text-[#F2F1EC]">{csc.workingHours}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="border-t border-[rgba(34,197,94,0.15)] pt-3 flex items-center justify-between text-xs text-[#9A9A9E]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#22C55E]" />
            <span>Carry original Aadhaar + rejected reference copy when visiting any CSC.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1C1C1F] border border-[#22C55E]/30 hover:bg-[#22C55E]/20 text-[#22C55E] font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
