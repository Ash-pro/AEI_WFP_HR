export const PALESTINE_GOVERNORATES = [
  'شمال غزة',
  'غزة',
  'دير البلح / الوسطى',
  'خان يونس',
  'رفح'
];

export const JOB_CATEGORIES = ['موظف', 'متطوع', 'أمن'] as const;

export const MARITAL_STATUSES = ['أعزب', 'متزوج', 'مطلق', 'أرمل'] as const;

export const EDUCATION_DEGREES = [
  'إعدادي',
  'ثانوي',
  'دبلوم',
  'بكالوريوس',
  'ماجستير',
  'دكتوراه'
] as const;

export const UNIVERSITIES_LIST = [
  'الجامعة الإسلامية - غزة',
  'جامعة الأزهر - غزة',
  'جامعة الأقصى',
  'جامعة القدس المفتوحة',
  'الكلية الجامعية للعلوم التطبيقية',
  'جامعة فلسطين',
  'كلية فلسطين التقنية',
  'جامعة بيرزيت',
  'جامعة النجاح الوطنية',
  'جامعة القدس - أبو ديس',
  'جامعة خارجية / أخرى'
];

export const HOUSING_TYPES = [
  'ملك',
  'إيجار',
  'نزوح - مدرسة إيواء',
  'نزوح - خيمة',
  'استضافة لدى أقارب',
  'أخرى'
] as const;

export const PAYMENT_METHODS = [
  'حساب بنك فلسطين',
  'كود جوال باي / محفظة',
  'حوالة نقدية أخرى'
] as const;

export const BANK_BRANCHES = [
  'فرع الرمال - غزة',
  'فرع النصر - غزة',
  'فرع عمر المختار - غزة',
  'فرع دير البلح',
  'فرع النصيرات',
  'فرع خان يونس',
  'فرع رفح'
];

import { REAL_POINTS, REAL_SUPERVISORS, REAL_COORDINATOR } from './realData';
import { WorkPoint, PointTeam } from './types';

export const INITIAL_WORK_POINTS: WorkPoint[] = [
  ...REAL_POINTS.map((pt) => ({
    id: pt.id,
    name: pt.name,
    governorate: pt.geo_zone === 'الوسطى' ? 'دير البلح / الوسطى' : pt.geo_zone,
    geo_zone: pt.geo_zone,
    point_area: pt.point_area,
    address_details: pt.address || `${pt.geo_zone} - منطقة ${pt.point_area}`,
    latitude: pt.latitude,
    longitude: pt.longitude,
    programs_supported: pt.programs_supported,
    supervisor: pt.supervisor,
    supervisor_name: pt.supervisor,
    staff_count: pt.staff_count,
    is_active: true,
  })),
  {
    id: 'pt-admin',
    name: 'موظف إداري / مكتب التنسيق والإدارة العامة',
    governorate: 'دير البلح / الوسطى',
    geo_zone: 'إداري',
    point_area: 'مكتب التنسيق',
    address_details: 'دير البلح - شارع السلام، المقر الإداري المركزي لجمعية أرض الإنسان AEI',
    latitude: 31.4195,
    longitude: 34.3530,
    programs_supported: ['إدارة ومتابعة'],
    supervisor: 'أمل سمير اسماعيل عوض',
    supervisor_name: 'أمل سمير اسماعيل عوض',
    staff_count: 1,
    is_active: true,
  },
];

export const INITIAL_SUPERVISORS = [
  {
    id: 'sup-coord',
    national_id: REAL_COORDINATOR.national_id,
    name: REAL_COORDINATOR.full_name_ar,
    role: REAL_COORDINATOR.role,
    phone: REAL_COORDINATOR.phone,
    zones: 'كافة المحافظات والمناطق',
    program: 'إدارة وتنسيق عام',
  },
  ...REAL_SUPERVISORS.map((s, idx) => ({
    id: `sup-${idx + 1}`,
    national_id: s.national_id,
    name: s.full_name_ar,
    role: s.role,
    phone: s.phone,
    zones: s.zones,
    program: s.program,
    points_count: s.points_count,
    staff_count: s.staff_count,
  })),
];

export const INITIAL_TEAMS: PointTeam[] = INITIAL_WORK_POINTS.map((pt) => {
  const isTSFP = pt.programs_supported.includes('TSFP');
  const programType = isTSFP ? ('TSFP' as const) : ('BSFP_Cash' as const);
  const teamLabel = isTSFP
    ? `فريق التغذية العلاجية (TSFP) - ${pt.name}`
    : pt.id === 'pt-admin'
    ? `فريق التنسيق والإدارة العامة`
    : `فريق التغذية الوقائية والكاش (BSFP + Cash) - ${pt.name}`;

  return {
    id: `team-${pt.id}`,
    point_id: pt.id,
    team_name: teamLabel,
    program: programType,
    supervisor_name: pt.supervisor_name || 'أمل سمير اسماعيل عوض',
  };
});
