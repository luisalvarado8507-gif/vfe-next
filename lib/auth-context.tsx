'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

// ── Roles RBAC ────────────────────────────────────────────────────────────
// viewer  — acceso de solo lectura (todos los usuarios autenticados)
// editor  — puede crear, editar y cambiar estado de medicamentos
// admin   — todo lo anterior + gestión de capítulos, usuarios y configuración
export type UserRole = 'viewer' | 'editor' | 'admin';

export interface RolePermissions {
  canView: boolean;           // ver medicamentos y fichas
  canEdit: boolean;           // crear y editar medicamentos
  canChangeEstado: boolean;   // cambiar estado regulatorio (autorizar/suspender)
  canManageChaps: boolean;    // crear/editar/eliminar capítulos
  canExport: boolean;         // exportar base de datos
  canImport: boolean;         // importar datos
  canViewAudit: boolean;      // ver audit log
  canManageUsers: boolean;    // gestionar roles de usuarios (solo admin)
  canViewDocs: boolean;       // ver documentación API
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: {
    canView: true,
    canEdit: false,
    canChangeEstado: false,
    canManageChaps: false,
    canExport: false,
    canImport: false,
    canViewAudit: false,
    canManageUsers: false,
    canViewDocs: true,
  },
  editor: {
    canView: true,
    canEdit: true,
    canChangeEstado: true,
    canManageChaps: false,
    canExport: true,
    canImport: true,
    canViewAudit: true,
    canManageUsers: false,
    canViewDocs: true,
  },
  admin: {
    canView: true,
    canEdit: true,
    canChangeEstado: true,
    canManageChaps: true,
    canExport: true,
    canImport: true,
    canViewAudit: true,
    canManageUsers: true,
    canViewDocs: true,
  },
};

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isEditor: boolean;        // alias legacy: role === 'editor' || role === 'admin'
  isAdmin: boolean;         // role === 'admin'
  permissions: RolePermissions;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'viewer',
  isEditor: false,
  isAdmin: false,
  permissions: ROLE_PERMISSIONS.viewer,
  loading: true,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null,
});

function getRoleFromClaims(claims: Record<string, unknown>): UserRole {
  if (claims.admin === true) return 'admin';
  if (claims.editor === true) return 'editor';
  return 'viewer';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const token = await u.getIdTokenResult(true);
          setRole(getRoleFromClaims(token.claims as Record<string, unknown>));
        } catch {
          setRole('viewer');
        }
      } else {
        setRole('viewer');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdTokenResult(true);
    setRole(getRoleFromClaims(token.claims as Record<string, unknown>));
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setRole('viewer');
  }, []);

  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const isEditor = role === 'editor' || role === 'admin';
  const isAdmin = role === 'admin';
  const permissions = ROLE_PERMISSIONS[role];

  return (
    <AuthContext.Provider value={{
      user, role, isEditor, isAdmin, permissions, loading, login, logout, getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
