import React, { createContext, useContext, useState, useEffect } from 'react';
import { CedarRole } from '../types';
import {
  loginUser,
  getApplications,
  CitizenProfile,
  CitizenUser,
  ApplicationItem,
  AuthLoginResponse,
} from '../services/api-client';

export const PLATFORM_OWNER_EMAILS = [
  'shivanshushukla1919@gmail.com',
  'shivanshushukla2602@gmail.com',
];
export const PLATFORM_OWNER_EMAIL = 'shivanshushukla1919@gmail.com';

export const checkIsOwner = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return PLATFORM_OWNER_EMAILS.includes(normalized) || normalized === PLATFORM_OWNER_EMAIL.toLowerCase();
};

interface AuthContextType {
  role: CedarRole;
  setRole: (role: CedarRole) => void;
  user: CitizenUser | null;
  profile: CitizenProfile | null;
  token: string | null;
  applications: ApplicationItem[];
  loading: boolean;
  isOwner: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  completeLogin: (data: AuthLoginResponse) => void;
  logout: () => void;
  refreshApplications: () => Promise<void>;
  canPerformAction: (action: string) => boolean;
}

const CEDAR_PERMISSIONS: Record<CedarRole, string[]> = {
  CITIZEN: [
    'CreateAnalysis',
    'UploadEvidence',
    'ViewOwnAnalysis',
    'ExportActionPlan',
    'ViewCSCLocator'
  ],
  ADMIN: [
    'CreateAnalysis',
    'UploadEvidence',
    'ViewOwnAnalysis',
    'ExportActionPlan',
    'ManageKnowledgeBase',
    'UpdateServiceMetadata',
    'ManageConfig'
  ],
  AUDITOR: [
    'CreateAnalysis',
    'UploadEvidence',
    'ViewOwnAnalysis',
    'ExportActionPlan',
    'InspectReasoningTrace',
    'ReviewSourceDocuments',
    'InspectAnonymizedPatterns',
    'VerifyAuthenticityRules'
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleState, setRoleState] = useState<CedarRole>('CITIZEN');
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isOwner = checkIsOwner(user?.email);

  const setRole = (newRole: CedarRole) => {
    const granted = isOwner ? ['CITIZEN', 'ADMIN', 'AUDITOR'] : (user?.grantedRoles || ['CITIZEN']);
    if (granted.includes(newRole)) {
      setRoleState(newRole);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('sevarecover_session');
    if (!saved) return;
    try {
      const session = JSON.parse(saved) as Pick<AuthLoginResponse, 'token' | 'user' | 'profile' | 'applications'>;
      if (session.token && session.user && session.profile) {
        const userIsOwner = checkIsOwner(session.user.email);
        if (userIsOwner) {
          session.user.grantedRoles = ['CITIZEN', 'ADMIN', 'AUDITOR'];
        }
        setToken(session.token);
        setUser(session.user);
        setProfile(session.profile);
        setApplications(session.applications || []);
        if (session.user.grantedRoles?.includes('ADMIN')) {
          setRoleState('ADMIN');
        } else if (session.user.grantedRoles?.includes('AUDITOR')) {
          setRoleState('AUDITOR');
        } else {
          setRoleState('CITIZEN');
        }
      }
    } catch {
      localStorage.removeItem('sevarecover_session');
    }
  }, []);

  const login = async (email?: string, password?: string) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      const userIsOwner = checkIsOwner(data.user?.email);
      if (userIsOwner && data.user) {
        data.user.grantedRoles = ['CITIZEN', 'ADMIN', 'AUDITOR'];
      }
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      setApplications(data.applications || []);
      if (data.user?.grantedRoles?.includes('ADMIN')) {
        setRoleState('ADMIN');
      } else if (data.user?.grantedRoles?.includes('AUDITOR')) {
        setRoleState('AUDITOR');
      } else {
        setRoleState('CITIZEN');
      }
      localStorage.setItem('sevarecover_session', JSON.stringify(data));
      localStorage.setItem('sevarecover_jwt_token', data.token);
    } catch (err) {
      console.error('Failed to log in user:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data: AuthLoginResponse) => {
    const userIsOwner = checkIsOwner(data.user?.email);
    if (userIsOwner && data.user) {
      data.user.grantedRoles = ['CITIZEN', 'ADMIN', 'AUDITOR'];
    }
    localStorage.setItem('sevarecover_jwt_token', data.token);
    localStorage.setItem('sevarecover_session', JSON.stringify(data));
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    setApplications(data.applications || []);
    if (data.user?.grantedRoles?.includes('ADMIN')) {
      setRoleState('ADMIN');
    } else if (data.user?.grantedRoles?.includes('AUDITOR')) {
      setRoleState('AUDITOR');
    } else {
      setRoleState('CITIZEN');
    }
  };

  const logout = () => {
    localStorage.removeItem('sevarecover_jwt_token');
    localStorage.removeItem('sevarecover_session');
    setToken(null);
    setUser(null);
    setProfile(null);
    setApplications([]);
    setRoleState('CITIZEN');
  };

  const refreshApplications = async () => {
    try {
      const apps = await getApplications();
      setApplications(apps);
    } catch (err) {
      console.error('Failed to refresh applications:', err);
    }
  };

  const canPerformAction = (action: string): boolean => {
    if (isOwner) return true;
    return CEDAR_PERMISSIONS[roleState]?.includes(action) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        role: roleState,
        setRole,
        user,
        profile,
        token,
        applications,
        loading,
        isOwner,
        login,
        completeLogin,
        logout,
        refreshApplications,
        canPerformAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
