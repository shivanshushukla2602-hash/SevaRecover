import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface CitizenProfileProps {
  onNavigate?: (view: string, data?: any) => void;
  onSaveProfile?: (profile: any) => void;
}

export default function CitizenProfile({ onSaveProfile }: CitizenProfileProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [localProfile, setLocalProfile] = useState(
    profile || {
      age: 30,
      gender: 'Male',
      income: '250000',
      category: 'General',
      state: 'Maharashtra',
      occupation: 'Farmer',
    }
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (onSaveProfile) {
      onSaveProfile(localProfile);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      navigate('/schemes');
    }, 800);
  };

  return (
    <div className="ds-shell py-8 sm:py-12 text-[#F2F1EC]">
      <div className="mb-8 space-y-1">
        <h2 className="text-3xl font-heading font-extrabold text-[#F8FAFC] flex items-center gap-3">
          <User className="text-[#22C55E]" /> {t('citizenProfileTitle')}
        </h2>
        <p className="text-xs text-[#A8ABB3]">
          {t('profileWelcome')} <span className="font-bold text-[#F8FAFC]">{user?.name || 'Abhilash'}</span>. {t('profileSub')}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#141416] p-6 rounded-2xl shadow-lg border border-[rgba(34,197,94,0.15)] space-y-6">
        {savedSuccess && (
          <div className="bg-sage-500/15 border border-sage-500/30 p-3 rounded-xl text-xs text-sage-400 flex items-center gap-2 font-bold">
            <CheckCircle2 size={16} /> Profile saved! Routing to eligible schemes...
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A8ABB3] mb-1">{t('ageLabel')}</label>
            <input
              type="number"
              name="age"
              value={localProfile.age}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-lg text-xs text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#22C55E]"
              placeholder="e.g. 30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8ABB3] mb-1">{t('genderLabel')}</label>
            <select
              name="gender"
              value={localProfile.gender}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-lg text-xs text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#22C55E]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8ABB3] mb-1">{t('incomeLabel')}</label>
            <input
              type="number"
              name="income"
              value={localProfile.income}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-lg text-xs text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#22C55E] font-mono"
              placeholder="e.g. 250000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8ABB3] mb-1">{t('categoryLabel')}</label>
            <select
              name="category"
              value={localProfile.category}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-lg text-xs text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#22C55E]"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8ABB3] mb-1">{t('stateLabel')}</label>
            <input
              type="text"
              name="state"
              value={localProfile.state}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-lg text-xs text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#22C55E]"
              placeholder="e.g. Maharashtra"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#A8ABB3] mb-1">{t('occupationLabel')}</label>
            <select
              name="occupation"
              value={localProfile.occupation}
              onChange={handleChange}
              className="w-full p-2.5 bg-[#0A0A0B] border border-[rgba(34,197,94,0.2)] rounded-lg text-xs text-[#F8FAFC] outline-none focus:ring-2 focus:ring-[#22C55E]"
            >
              <option value="Farmer">Farmer</option>
              <option value="Student">Student</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Salaried">Salaried</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-heading font-bold px-5 py-2.5 rounded-xl transition-all text-xs shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-pointer"
          >
            <Search size={15} /> {t('findSchemesBtn')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
