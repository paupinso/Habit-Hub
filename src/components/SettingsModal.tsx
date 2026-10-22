import React, { useState } from 'react';
import {
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  Download,
  Upload,
  RotateCcw,
  Info,
  CheckCircle,
  HelpCircle,
  Share2,
  PlusSquare,
  Sparkles,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isPhoneFrameActive: boolean;
  onTogglePhoneFrame: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (json: string) => boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isPhoneFrameActive,
  onTogglePhoneFrame,
  onResetData,
  onExportData,
  onImportData,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.getSettings().sound);
  const [hapticsEnabled, setHapticsEnabled] = useState(sound.getSettings().haptics);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
    if (next) sound.tap();
  };

  const handleHapticsToggle = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    sound.setHapticsEnabled(next);
    if (next) sound.vibrate(20);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        sound.completeHabit();
        setImportStatus('Dades importades correctament!');
        setTimeout(() => setImportStatus(null), 3500);
      } else {
        setImportStatus('Error en el format del fitxer JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
              Ajustos i Configuració
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Format Blanc i Verd, experiència mòbil i dades
            </p>
          </div>
        </div>
      </div>

      {/* 1. Device and Interface preferences */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
          Experiència Mòbil
        </span>

        {/* Phone Frame Toggle for desktop users */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Simulador de marc mòbil
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Visualitza l’aplicació com un smartphone
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.tap();
              onTogglePhoneFrame();
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isPhoneFrameActive ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isPhoneFrameActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <div>
              <span className="text-xs font-bold text-slate-900 block">Efectes sonors</span>
              <span className="text-[10px] text-slate-500 font-medium">
                Feedback auditiu suau en completar hàbits
              </span>
            </div>
          </div>
          <button
            onClick={handleSoundToggle}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Haptics toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Vibració tàctil</span>
              <span className="text-[10px] text-slate-500 font-medium">
                Vibració física en tocar botons al telèfon
              </span>
            </div>
          </div>
          <button
            onClick={handleHapticsToggle}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              hapticsEnabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. PWA Mobile Installation Guide */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Instal·lar com a App al Mòbil</span>
          </div>
          <button
            onClick={() => {
              sound.tap();
              setShowInstallGuide(!showInstallGuide);
            }}
            className="text-[11px] text-emerald-700 font-bold underline cursor-pointer"
          >
            {showInstallGuide ? 'Amagar guia' : 'Com fer-ho?'}
          </button>
        </div>

        {showInstallGuide && (
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-slate-700 space-y-2 leading-relaxed animate-in fade-in duration-200">
            <p className="font-semibold text-emerald-950">
              Per tenir HabitPulse a la pantalla d’inici del teu telèfon mòbil com una app nativa:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>
                <strong>A iPhone (Safari):</strong> Toca el botó de Compartir (icona de fletxa amunt) i selecciona <em>«Afegir a la pantalla d’inici»</em>.
              </li>
              <li>
                <strong>A Android (Chrome):</strong> Toca els tres punts del menú superior i selecciona <em>«Instal·lar aplicació»</em> o <em>«Afegir a la pantalla d’inici»</em>.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 3. Data Backup and Restore */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
          Còpies de Seguretat i Dades
        </span>

        {importStatus && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.tap();
              onExportData();
            }}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar JSON</span>
          </button>

          <label className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Importar JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={() => {
            sound.tap();
            if (confirm('Segur que vols reiniciar les dades a l’estat inicial?')) {
              onResetData();
            }
          }}
          className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablir dades d'exemple</span>
        </button>
      </div>
    </div>
  );
};
