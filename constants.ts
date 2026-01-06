
import { VoiceName } from './types';

export const PASTEL_COLORS = [
  '#F0F9FF', '#FDF2F8', '#ECFDF5', '#FFFBEB', '#F5F3FF',
  '#E9D5FF', '#F9FAFB', '#FEF2F2', '#F0FDF4', '#FFF7ED', 
  '#F0FDFA', '#EFF6FF', '#FAF5FF', '#FDF4FF', '#FFFBF0', '#F5FEFD'
];

export const DARK_COLORS = [
  '#0F172A', '#1E1B4B', '#2E1065', '#111827', '#064E3B', 
  '#450A0A', '#171717', '#27272A', '#020617', '#1E293B', 
  '#312E81', '#3730A3', '#5B21B6', '#701A75', '#831843', '#164E63'
];

export const UI_COLORS_FOR_PASTEL = '#1E293B'; // Dark elements for pastel background
export const UI_COLORS_FOR_DARK = '#F8FAFC';   // Light elements for dark background

export const VOICES = [
  { name: VoiceName.Puck, gender: 'Male', label: 'Puck (Deep)' },
  { name: VoiceName.Charon, gender: 'Male', label: 'Charon (Smooth)' },
  { name: VoiceName.Fenrir, gender: 'Male', label: 'Fenrir (Energetic)' },
  { name: VoiceName.Kore, gender: 'Female', label: 'Kore (Calm)' },
  { name: VoiceName.Zephyr, gender: 'Female', label: 'Zephyr (Bright)' },
  { name: VoiceName.Aoede, gender: 'Female', label: 'Aoede (Melodic)' },
];

export const ASPECT_RATIOS = [
  '1:1', '9:16', '16:9', '5:3', '4:3', '21:9'
];
