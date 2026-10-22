import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneSimulatorWrapperProps {
  children: React.ReactNode;
  isPhoneFrameActive: boolean;
}

export const PhoneSimulatorWrapper: React.FC<PhoneSimulatorWrapperProps> = ({
  children,
  isPhoneFrameActive,
}) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-start text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Container: clean white canvas with crisp emerald accents */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 text-slate-900 flex flex-col relative border-x border-slate-200/80 shadow-xl">
        
        {/* Optional top phone bezel simulator (active when toggled in settings) */}
        {isPhoneFrameActive && (
          <div className="flex items-center justify-between px-5 pt-2 pb-1.5 z-40 bg-white border-b border-slate-200 text-slate-500 text-xs shrink-0 select-none">
            <span className="font-bold tracking-tight text-slate-800 text-[12px]">{timeStr}</span>
            
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-800 font-bold">HabitPulse</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col w-full relative">
          {children}
        </div>
      </div>
    </div>
  );
};
