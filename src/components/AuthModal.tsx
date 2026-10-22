import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  UserPlus,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Trash2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  loadAccounts,
  getCurrentUser,
  registerUser,
  switchUser,
  deleteAccount,
} from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChanged: (newUser: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserChanged,
}) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => getCurrentUser());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadAccounts());
  const [activeTab, setActiveTab] = useState<'register' | 'switch'>('register');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleRegisterOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Si us plau, introdueix un correu electrònic vàlid.');
      return;
    }

    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const user = registerUser(cleanEmail, cleanName);
    const updatedAccounts = loadAccounts();
    setAccounts(updatedAccounts);
    setCurrentUser(user);
    setSuccessMessage(`Compte activat per a ${user.email}! Dades personals aïllades amb èxit.`);
    setName('');
    setEmail('');

    setTimeout(() => {
      onUserChanged(user);
      onClose();
    }, 900);
  };

  const handleSwitch = (userId: string) => {
    const updated = switchUser(userId);
    setAccounts(loadAccounts());
    setCurrentUser(updated);
    setSuccessMessage(`Canviat al compte de ${updated.name} (${updated.email})`);
    setTimeout(() => {
      onUserChanged(updated);
      onClose();
    }, 600);
  };

  const handleDelete = (userId: string, userEmail: string) => {
    if (confirm(`Estàs segur que vols eliminar el compte ${userEmail}?`)) {
      deleteAccount(userId);
      const remaining = loadAccounts();
      setAccounts(remaining);
      const current = getCurrentUser();
      setCurrentUser(current);
      onUserChanged(current);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Tancar"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-400/20 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Multi-usuari i Privacitat
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Registre i Gestió de Comptes</h2>
          <p className="text-emerald-100/90 text-sm mt-1">
            Cada client o comprador té el seu propi espai amb el seu correu. Totes les dades
            nutricionals, àpats i gràfics són 100% personals.
          </p>

          {/* Active User Pill */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center shadow-inner text-sm">
                {currentUser.avatarInitials || 'US'}
              </div>
              <div>
                <p className="text-xs text-emerald-200 uppercase font-bold tracking-wider">
                  Usuari Actiu Ara
                </p>
                <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-white/80">{currentUser.email}</p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-400/25 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-300/40 font-medium">
              Sessió iniciada
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Nou Registre / Entrada
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('switch');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'switch'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Canviar de Compte ({accounts.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-medium">
              {error}
            </div>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterOrLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom complet o àlies
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Pau Pinsó o Maria Soler"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correu electrònic *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nouclient@exemple.cat"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Si el correu ja existeix, s'inicia la sessió directament amb les seves dades guardades.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Garantia per a futurs compradors:</strong>{' '}
                    Cada persona que descarregui o compri la teva app podrà registrar el seu propi correu.
                    L'anàlisi de fotografies de menjar, el balanç calòric diari i els hàbits personals seran
                    estrictament individuals i independents.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Registrar / Entrar amb aquest correu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Selecciona qualsevol dels comptes registrats en aquest dispositiu per carregar immediatament
                el seu diari nutricional i gràfics:
              </p>

              {accounts.map((acc) => {
                const isActive = acc.id === currentUser.id;
                return (
                  <div
                    key={acc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shrink-0 ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {acc.avatarInitials || 'US'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{acc.name}</p>
                          {isActive && (
                            <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">
                              Actiu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleSwitch(acc.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Accedir
                        </button>
                      )}

                      {accounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDelete(acc.id, acc.email)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar compte"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>HabitPulse Pro • Multi-Tenant Architecture</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </div>
  );
};
