import React, { useState } from 'react';
import { X, Sparkles, Check, Droplets, Activity, BookOpen, Target, Smile, Moon } from 'lucide-react';
import { Habit, HabitCategory, DayMoment } from '../types';
import { sound } from '../utils/audio';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

const TEMPLATES: {
  title: string;
  category: HabitCategory;
  timeOfDay: DayMoment;
  targetValue: number;
  unit?: string;
  icon: string;
  color: string;
}[] = [
  {
    title: "Beure 2L d'aigua",
    category: 'salut',
    timeOfDay: 'tot-el-dia',
    targetValue: 2,
    unit: 'L',
    icon: 'Droplet',
    color: 'emerald',
  },
  {
    title: '30 minuts de caminada o esport',
    category: 'salut',
    timeOfDay: 'tarda',
    targetValue: 30,
    unit: 'min',
    icon: 'Activity',
    color: 'emerald',
  },
  {
    title: '0 Sucre Afegit',
    category: 'salut',
    timeOfDay: 'tot-el-dia',
    targetValue: 1,
    unit: 'dia',
    icon: 'Target',
    color: 'emerald',
  },
  {
    title: 'Llegir 15 pàgines',
    category: 'ment',
    timeOfDay: 'nit',
    targetValue: 15,
    unit: 'pàgines',
    icon: 'BookOpen',
    color: 'emerald',
  },
  {
    title: 'Organitzar els 5 àpats i kcal',
    category: 'productivitat',
    timeOfDay: 'mati',
    targetValue: 1,
    unit: 'vegada',
    icon: 'Target',
    color: 'emerald',
  },
  {
    title: 'Apagar pantalles a les 22:30',
    category: 'energia',
    timeOfDay: 'nit',
    targetValue: 1,
    unit: 'vegada',
    icon: 'Moon',
    color: 'emerald',
  },
];

export const NewHabitModal: React.FC<NewHabitModalProps> = ({ isOpen, onClose, onAddHabit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('salut');
  const [timeOfDay, setTimeOfDay] = useState<DayMoment>('tot-el-dia');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('Activity');
  const [selectedColor, setSelectedColor] = useState<string>('emerald');

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    sound.tap();
    setTitle(tpl.title);
    setCategory(tpl.category);
    setTimeOfDay(tpl.timeOfDay);
    setTargetValue(tpl.targetValue);
    setUnit(tpl.unit || '');
    setSelectedIcon(tpl.icon);
    setSelectedColor(tpl.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.completeHabit();
    onAddHabit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      timeOfDay,
      targetValue: Number(targetValue) || 1,
      unit: unit.trim() || undefined,
      icon: selectedIcon,
      color: selectedColor,
      frequency: 'daily',
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setTargetValue(1);
    setUnit('');
    onClose();
  };

  const icons = [
    { id: 'Activity', label: 'Esport' },
    { id: 'Droplet', label: 'Aigua' },
    { id: 'BookOpen', label: 'Lectura' },
    { id: 'Target', label: 'Objectiu' },
    { id: 'Smile', label: 'Benestar' },
    { id: 'Moon', label: 'Descans' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom-8 duration-200">
        {/* Drag handle affordance for mobile */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-3 sm:hidden" />

        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Nou Hàbit o Rutina
            </h3>
          </div>
          <button
            onClick={() => {
              sound.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Templates Strip */}
        <div className="p-4 border-b border-slate-100 bg-emerald-50/40">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-2">
            Plantilles ràpides:
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold whitespace-nowrap active:scale-95 transition-all shadow-sm"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="habit-title" className="block text-xs font-bold text-slate-700">
              Nom de l'hàbit *
            </label>
            <input
              id="habit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Beure 2L d'aigua, caminar 30 min..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Moment of the day */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Moment del dia
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'tot-el-dia', label: 'Tot el dia' },
                { id: 'mati', label: 'Matí' },
                { id: 'tarda', label: 'Tarda' },
                { id: 'nit', label: 'Nit' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setTimeOfDay(m.id as DayMoment);
                  }}
                  className={`min-h-[38px] rounded-xl text-xs font-bold transition-all ${
                    timeOfDay === m.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'salut', label: 'Salut' },
                { id: 'productivitat', label: 'Productivitat' },
                { id: 'ment', label: 'Ment' },
                { id: 'energia', label: 'Energia' },
                { id: 'personal', label: 'Personal' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setCategory(c.id as HabitCategory);
                  }}
                  className={`min-h-[36px] rounded-xl text-xs font-bold transition-all ${
                    category === c.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="habit-target" className="block text-xs font-bold text-slate-700">
                Objectiu numèric
              </label>
              <input
                id="habit-target"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="habit-unit" className="block text-xs font-bold text-slate-700">
                Unitat (opcional)
              </label>
              <input
                id="habit-unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ex: min, L, vegades..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Icon Choice */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Icona</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setSelectedIcon(ic.id);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedIcon === ic.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-bold">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Crear Hàbit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
