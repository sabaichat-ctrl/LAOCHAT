import { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', labelLao: 'ທັງໝົດ', labelEn: 'All', icon: 'Compass', color: 'from-blue-600 to-indigo-600' },
  { id: 'video', labelLao: 'ວິດີໂອ', labelEn: 'Videos', icon: 'PlaySquare', color: 'from-rose-500 to-red-600' },
  { id: 'photo', labelLao: 'ຮູບພາບ', labelEn: 'Photos', icon: 'Image', color: 'from-amber-500 to-orange-600' },
  { id: 'article', labelLao: 'ບົດຄວາມ', labelEn: 'Articles', icon: 'BookOpen', color: 'from-emerald-500 to-teal-600' },
  { id: 'news', labelLao: 'ຂ່າວສານ & ເຫດການ', labelEn: 'News & Events', icon: 'Newspaper', color: 'from-sky-500 to-blue-600' },
  { id: 'food_travel', labelLao: 'ອາຫານ & ທ່ອງທ່ຽວ', labelEn: 'Food & Travel', icon: 'Utensils', color: 'from-orange-500 to-amber-600' },
  { id: 'entertainment', labelLao: 'ບັນເທີງ & ດົນຕີ', labelEn: 'Entertainment', icon: 'Music', color: 'from-purple-500 to-pink-600' },
  { id: 'tech_business', labelLao: 'ທຸລະກິດ & ໄອທີ', labelEn: 'Business & Tech', icon: 'Briefcase', color: 'from-cyan-500 to-blue-600' },
  { id: 'education', labelLao: 'ສຶກສາ & ຄວາມຮູ້', labelEn: 'Education', icon: 'GraduationCap', color: 'from-violet-500 to-indigo-600' },
  { id: 'lifestyle', labelLao: 'ຊີວິດປະຈຳວັນ', labelEn: 'Lifestyle', icon: 'Heart', color: 'from-pink-500 to-rose-600' },
];

export const TRENDING_TAGS = [
  { tag: '#LAOCHAT', count: '128K' },
  { tag: '#ທ່ຽວລາວ', count: '94K' },
  { tag: '#ອາຫານລາວ', count: '81K' },
  { tag: '#ຫຼວງພະບາງ', count: '52K' },
  { tag: '#ວັງວຽງ', count: '46K' },
  { tag: '#ວຽງຈັນ', count: '39K' },
  { tag: '#BCELOne', count: '24K' },
  { tag: '#ເທັກໂນໂລຊີລາວ', count: '18K' },
];
