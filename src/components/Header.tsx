import React, { useState } from 'react';
import { Shield, Globe, UserCheck, ChevronDown, Check, Menu, X, LogIn, LogOut, User as UserIcon, Sun, Moon, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage, ALL_LANGUAGES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Language, CedarRole } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { role, setRole, user, logout, token, isOwner } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filteredLanguages = ALL_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const roles: { id: CedarRole; label: string; desc: string }[] = [
    { id: 'CITIZEN' as CedarRole, label: t('roleCitizen'), desc: t('roleCitizenDesc') },
    { id: 'ADMIN' as CedarRole, label: t('roleAdmin'), desc: t('roleAdminDesc') },
    { id: 'AUDITOR' as CedarRole, label: t('roleAuditor'), desc: t('roleAuditorDesc') },
  ].filter(r => isOwner || (user?.grantedRoles || ['CITIZEN']).includes(r.id as any));

  const navItems = [
    { id: 'landing', label: t('navHome'), path: '/' },
    { id: 'service-selection', label: t('navAnalyze'), path: '/select-service' },
    { id: 'dashboard', label: t('navDashboard'), path: '/dashboard' },
    { id: 'schemes', label: t('navSchemes'), path: '/schemes' },
    { id: 'intelligence', label: t('navIntelligence'), path: '/intelligence' },
    { id: 'how-it-works', label: t('navHowItWorks'), path: '/how-it-works' },
  ];

  // Role-gated extra navigation tabs (aligned with active role view)
  if (role === 'ADMIN' || (isOwner && location.pathname.startsWith('/admin'))) {
    navItems.push({ id: 'admin-panel', label: t('navAdminPanel'), path: '/admin' });
  } else if (role === 'AUDITOR' || (isOwner && location.pathname.startsWith('/audit'))) {
    navItems.push({ id: 'auditor-logs', label: t('navAuditorLogs'), path: '/audit' });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-[rgba(34,197,94,0.2)] transition-all duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => {
            setActiveTab('landing');
            navigate('/');
          }}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#22C55E] rounded-lg p-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#141416] border border-[#22C55E]/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.25)] group-hover:scale-105 group-hover:border-[#22C55E] transition-all">
            <Shield aria-hidden="true" className="w-5 h-5 text-[#22C55E] fill-[#22C55E]/20 stroke-current" />
          </div>
          <div className="text-left">
            <span className="font-heading font-extrabold text-lg gold-text leading-tight block">
              {t('appName')}
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#A8ABB3] block">
              {t('appLayerTitle')}
            </span>
          </div>
        </button>

        {/* Dynamic Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#141416] border border-[rgba(34,197,94,0.2)] rounded-xl p-1.5 shrink-0">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                navigate(tab.path);
              }}
              className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#22C55E] text-[#052E16] font-bold shadow-[0_2px_12px_rgba(34,197,94,0.35)]'
                  : 'text-[#A8ABB3] hover:text-[#22C55E] hover:bg-[#22C55E]/10 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Header Right Tools */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* Cedar Authorization Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setLangMenuOpen(false);
                setUserMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                role === 'ADMIN'
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#4ADE80] shadow-[0_0_12px_rgba(34,197,94,0.25)]'
                  : role === 'AUDITOR'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.25)]'
                  : 'bg-[#141416] border-white/10 text-[#F2F1EC] hover:border-[#22C55E]/40'
              }`}
            >
              <UserCheck size={14} className={`shrink-0 ${role === 'ADMIN' ? 'text-[#22C55E]' : role === 'AUDITOR' ? 'text-emerald-400' : 'text-[#A8ABB3]'}`} />
              <span className="whitespace-nowrap">{roles.find((r) => r.id === role)?.label}</span>
              <ChevronDown size={12} className="text-[#A8ABB3] shrink-0" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141416] border border-[#22C55E]/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#22C55E] font-bold block">
                    {isOwner ? '👑 Platform Owner — All Roles' : t('cedarPolicyTitle')}
                  </span>
                  <span className="text-[11px] text-[#A8ABB3]">
                    {isOwner ? 'Unrestricted root authority across all roles' : t('cedarPolicySub')}
                  </span>
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setRoleMenuOpen(false);
                      if (r.id === 'ADMIN') navigate('/admin');
                      else if (r.id === 'AUDITOR') navigate('/audit');
                      else if (r.id === 'CITIZEN') navigate('/');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between cursor-pointer ${
                      role === r.id
                        ? 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 font-bold'
                        : 'text-[#A8ABB3] hover:text-[#0A0A0B] hover:bg-[#22C55E]/25'
                    }`}
                  >
                    <div>
                      <span className="font-bold block">{r.label}</span>
                      <span className="text-[10px] text-[#9A9A9E] font-normal leading-tight">{r.desc}</span>
                    </div>
                    {role === r.id && <Check size={14} className="text-[#22C55E] shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher (23 Languages with Search) */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setRoleMenuOpen(false);
                setUserMenuOpen(false);
                setLangSearch('');
              }}
              className="flex items-center gap-1.5 bg-[#141416] border border-white/10 hover:border-[#22C55E]/40 px-3 py-1.5 rounded-xl text-xs font-bold text-[#F2F1EC] cursor-pointer transition-all whitespace-nowrap shrink-0"
            >
              <Globe size={14} className="text-[#22C55E] shrink-0" />
              <span className="whitespace-nowrap">{ALL_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span>
              <ChevronDown size={12} className="text-[#A8ABB3] shrink-0" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141416] border border-[#22C55E]/30 rounded-2xl shadow-2xl p-2 z-50 max-h-96 flex flex-col">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8ABB3]" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Search 23 languages..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#0A0A0B] border border-white/10 rounded-xl text-xs text-[#F2F1EC] placeholder-[#A8ABB3]/60 focus:outline-none focus:border-[#22C55E]"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto space-y-1.5 pr-1 max-h-72">
                  {filteredLanguages.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[#A8ABB3]">No language found</div>
                  ) : (
                    <>
                      {/* Indian Languages Section */}
                      {filteredLanguages.some((l) => l.category === 'Indian Languages') && (
                        <div>
                          <div className="px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#22C55E] tracking-wider">
                            Indian Languages
                          </div>
                          {filteredLanguages
                            .filter((l) => l.category === 'Indian Languages')
                            .map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  setLanguage(lang.code);
                                  setLangMenuOpen(false);
                                  setLangSearch('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                                  language === lang.code
                                    ? 'bg-[#22C55E]/15 text-[#4ADE80] font-bold border border-[#22C55E]/30'
                                    : 'text-[#F2F1EC] hover:text-[#0A0A0B] hover:bg-[#22C55E]/20'
                                }`}
                              >
                                <div>
                                  <span className="font-semibold">{lang.nativeName}</span>
                                  <span className="text-[10px] text-[#A8ABB3] ml-1.5">({lang.name})</span>
                                </div>
                                {language === lang.code && <Check size={14} className="text-[#22C55E]" />}
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Global Languages Section */}
                      {filteredLanguages.some((l) => l.category === 'Global Languages') && (
                        <div className="pt-1 mt-1 border-t border-white/10">
                          <div className="px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#22C55E] tracking-wider">
                            Global Languages
                          </div>
                          {filteredLanguages
                            .filter((l) => l.category === 'Global Languages')
                            .map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  setLanguage(lang.code);
                                  setLangMenuOpen(false);
                                  setLangSearch('');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                                  language === lang.code
                                    ? 'bg-[#22C55E]/15 text-[#4ADE80] font-bold border border-[#22C55E]/30'
                                    : 'text-[#F2F1EC] hover:text-[#0A0A0B] hover:bg-[#22C55E]/20'
                                }`}
                              >
                                <div>
                                  <span className="font-semibold">{lang.nativeName}</span>
                                  <span className="text-[10px] text-[#A8ABB3] ml-1.5">({lang.name})</span>
                                </div>
                                {language === lang.code && <Check size={14} className="text-[#22C55E]" />}
                              </button>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center justify-center p-2 rounded-xl bg-[#141416] border border-white/10 hover:border-[#22C55E]/40 hover:bg-[#22C55E]/20 text-[#22C55E] cursor-pointer transition-all hover:scale-105"
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-[#22C55E] hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={15} className="text-[#22C55E] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* User Sign In / Profile Action */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setLangMenuOpen(false);
                  setRoleMenuOpen(false);
                }}
                className="flex items-center gap-2 bg-[#1C1C1F] border border-[#22C55E]/30 hover:border-[#22C55E] hover:bg-[#22C55E]/20 px-3 py-1.5 rounded-xl text-xs font-bold text-[#F2F1EC] cursor-pointer transition-all shadow-sm whitespace-nowrap shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-[#22C55E] text-[#0A0A0B] flex items-center justify-center font-extrabold text-[10px] shrink-0">
                  {isOwner ? '👑' : (user.name?.[0] || 'C')}
                </div>
                <span className="truncate max-w-[110px] whitespace-nowrap">{user.name}</span>
                {isOwner && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 tracking-wider shrink-0 whitespace-nowrap">
                    OWNER
                  </span>
                )}
                <ChevronDown size={12} className="text-[#A8ABB3] shrink-0" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#141416] border border-[#22C55E]/30 rounded-2xl shadow-2xl p-1.5 z-50">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#F2F1EC] hover:bg-[#22C55E]/20 hover:text-[#0A0A0B] flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <UserIcon size={14} className="text-[#22C55E]" /> {t('navProfile')}
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut size={14} /> {t('navSignOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/auth')}
              className="px-4 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center gap-1.5"
            >
              <LogIn size={14} /> {t('navLogin')}
            </button>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="lg:hidden p-2 rounded-xl text-[#A8ABB3] hover:text-[#0A0A0B] hover:bg-[#22C55E] cursor-pointer"
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-[#141416] border-b border-[#22C55E]/20 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate(tab.path);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#22C55E] text-[#0A0A0B]'
                    : 'text-[#A8ABB3] bg-[#0A0A0B] hover:bg-[#22C55E] hover:text-[#0A0A0B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Language Chooser */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#22C55E] font-bold">
              <Globe size={14} />
              <span>Language:</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-[#0A0A0B] border border-[#22C55E]/30 rounded-xl text-xs font-bold text-[#F2F1EC] px-3 py-1.5 focus:outline-none focus:border-[#22C55E]"
            >
              <optgroup label="Indian Languages">
                {ALL_LANGUAGES.filter((l) => l.category === 'Indian Languages').map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Global Languages">
                {ALL_LANGUAGES.filter((l) => l.category === 'Global Languages').map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setRole(role === 'CITIZEN' ? 'ADMIN' : role === 'ADMIN' ? 'AUDITOR' : 'CITIZEN');
              }}
              className="px-3 py-2 bg-[#0A0A0B] border border-[#22C55E]/30 rounded-xl text-xs font-bold text-[#22C55E] flex-1 cursor-pointer"
            >
              Role: {role}
            </button>

            <button
              onClick={toggleTheme}
              className="px-3 py-2 bg-[#0A0A0B] border border-[#22C55E]/30 rounded-xl text-xs font-bold text-[#22C55E] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {!user ? (
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate('/auth');
                }}
                className="px-4 py-2 bg-[#22C55E] text-[#0A0A0B] rounded-xl text-xs font-extrabold flex-1 cursor-pointer"
              >
                {t('navLogin')}
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileNavOpen(false);
                }}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-xs font-extrabold flex-1 cursor-pointer"
              >
                {t('navSignOut')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
