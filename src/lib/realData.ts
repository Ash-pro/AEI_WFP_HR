// ==============================================================================
// البيانات الفعلية المعتمدة لنظام AEI_WFP_HR - مستخرجة من ملف العمليات الرسمي
// إجمالي الكوادر: 145 | إجمالي نقاط التوزيع: 28
// ==============================================================================

export interface RealEmployeeRecord {
  national_id: string;
  full_name_ar: string;
  phone: string;
  department: string;
  category: string;
  supervisor_name: string;
  point_supervisor?: string;
  point_name: string;
  geo_zone: string;
  point_area: string;
}

export interface RealPointRecord {
  id: string;
  name: string;
  geo_zone: string;
  point_area: string;
  supervisor: string;
  staff_count: number;
  programs_supported: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
  is_shared?: boolean;
  partner_supervisor?: string;
  shared_base_point_id?: string;
}

export const REAL_COORDINATOR = {
  national_id: '949827901',
  full_name_ar: 'أمل سمير اسماعيل عوض',
  phone: '0599481714',
  role: 'منسق/ة المشروع (إدارة عليا)',
  email: 'amal.awad@aei.ps'
};

export const REAL_SUPERVISORS = [
  {
    national_id: '402938682',
    full_name_ar: 'أشرف أسامة دياب الصليبي',
    phone: '0598466903',
    role: 'مشرف ميداني',
    zones: 'الوسطى، خانيونس',
    program: 'BSFP + Cash',
    points_count: 8,
    staff_count: 35
  },
  {
    national_id: '403703689',
    full_name_ar: 'براء محمد قاسم الاسطل',
    phone: '0592238075',
    role: 'مشرف ميداني',
    zones: 'الوسطى، غزة',
    program: 'BSFP + Cash',
    points_count: 8,
    staff_count: 40
  },
  {
    national_id: '411100480',
    full_name_ar: 'هادي عيسى سعيد الأحول',
    phone: '0597828787',
    role: 'مشرف ميداني',
    zones: 'الوسطى، خانيونس، غزة',
    program: 'TSFP (علاجي) + BSFP (وقائي)',
    points_count: 9,
    staff_count: 28
  },
  {
    national_id: '402963664',
    full_name_ar: 'ياسمين مجدي محمد النجيلي',
    phone: '0597233284',
    role: 'مشرفة ميدانية',
    zones: 'خانيونس',
    program: 'BSFP + Cash',
    points_count: 8,
    staff_count: 37
  }
];

export const REAL_POINTS: RealPointRecord[] = [
  {
    "id": "pt-1",
    "name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات",
    "supervisor": "أشرف الصليبي",
    "staff_count": 5,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "مخيم النصيرات - شارع السوق، بالقرب من مركز البرامج النسائية",
    "latitude": 31.4485,
    "longitude": 34.3912,
    "is_shared": true,
    "partner_supervisor": "هادي الأحول"
  },
  {
    "id": "pt-2",
    "name": "الحكر",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح",
    "supervisor": "أشرف الصليبي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "دير البلح - منطقة الحكر، بالقرب من مسجد الحكر",
    "latitude": 31.4112,
    "longitude": 34.3541
  },
  {
    "id": "pt-3",
    "name": "الزهور",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح",
    "supervisor": "أشرف الصليبي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "دير البلح - حي الزهور، غرب شارع صلاح الدين",
    "latitude": 31.423,
    "longitude": 34.3615
  },
  {
    "id": "pt-4",
    "name": "العبادلة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة",
    "supervisor": "أشرف الصليبي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "القرارة - منطقة العبادلة، بالقرب من مفترق القرارة",
    "latitude": 31.3784,
    "longitude": 34.3312
  },
  {
    "id": "pt-5",
    "name": "المحطة",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح",
    "supervisor": "أشرف الصليبي",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "دير البلح - منطقة المحطة، محيط سكة الحديد القديمة",
    "latitude": 31.4187,
    "longitude": 34.3524
  },
  {
    "id": "pt-6",
    "name": "النبراس",
    "geo_zone": "خانيونس",
    "point_area": "القرارة",
    "supervisor": "أشرف الصليبي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "القرارة - منطقة النبراس، بالقرب من شارع صلاح الدين",
    "latitude": 31.3721,
    "longitude": 34.3289
  },
  {
    "id": "pt-7",
    "name": "حنين",
    "geo_zone": "خانيونس",
    "point_area": "القرارة",
    "supervisor": "أشرف الصليبي",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "القرارة - شارع حنين، غرب طريق المطاحن",
    "latitude": 31.3755,
    "longitude": 34.324
  },
  {
    "id": "pt-8",
    "name": "صفا - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات",
    "supervisor": "أشرف الصليبي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "مخيم النصيرات - منطقة صفا، بالقرب من مدرسة النصيرات الإعدادية",
    "latitude": 31.452,
    "longitude": 34.3875
  },
  {
    "id": "pt-9",
    "name": "ابو دلال",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "النصيرات - شارع صلاح الدين، محيط مجمع أبو دلال التجاري",
    "latitude": 31.442,
    "longitude": 34.385
  },
  {
    "id": "pt-10",
    "name": "ابو معيلق",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "دير البلح - منطقة أبو معيلق، امتداد شارع البركة",
    "latitude": 31.415,
    "longitude": 34.347
  },
  {
    "id": "pt-11",
    "name": "المخيمات المصرية",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "غزة - محيط المخيمات المصرية للإيواء، غرب المدينة",
    "latitude": 31.512,
    "longitude": 34.435
  },
  {
    "id": "pt-12",
    "name": "المسحال",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "غرب غزة - مخيم الشاطئ، محيط مؤسسة المسحال الثقافية",
    "latitude": 31.528,
    "longitude": 34.441
  },
  {
    "id": "pt-13",
    "name": "دوار فلسطين",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "وسط مدينة غزة - محيط ميدان وساحة فلسطين (الساحة)",
    "latitude": 31.506,
    "longitude": 34.463
  },
  {
    "id": "pt-14",
    "name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "شمال غزة - حي النصر، محيط العيادة السويدية",
    "latitude": 31.534,
    "longitude": 34.456,
    "is_shared": true,
    "partner_supervisor": "هادي الأحول"
  },
  {
    "id": "pt-15",
    "name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "غزة - حي الرمال الجنوبي، بالقرب من مكتبة وعمارة كحيل",
    "latitude": 31.515,
    "longitude": 34.448,
    "is_shared": true,
    "partner_supervisor": "هادي الأحول"
  },
  {
    "id": "pt-16",
    "name": "نقطة النفق",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "براء الاسطل",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "غزة - شارع النفق، بالقرب من محطة الشوا للمحروقات",
    "latitude": 31.522,
    "longitude": 34.471
  },
  {
    "id": "pt-17",
    "name": "السكة / البريج",
    "geo_zone": "الوسطى",
    "point_area": "البريج",
    "supervisor": "هادي الأحول",
    "staff_count": 4,
    "programs_supported": [
      "TSFP"
    ],
    "address": "مخيم البريج - منطقة السكة، المدخل الغربي للمخيم",
    "latitude": 31.439,
    "longitude": 34.402
  },
  {
    "id": "pt-18",
    "name": "الصقر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "هادي الأحول",
    "staff_count": 3,
    "programs_supported": [
      "TSFP"
    ],
    "address": "خانيونس - شارع الصقر، محيط مدرسة كمال ناصر",
    "latitude": 31.351,
    "longitude": 34.308
  },
  {
    "id": "pt-19",
    "name": "الغرابلي",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح",
    "supervisor": "هادي الأحول",
    "staff_count": 3,
    "programs_supported": [
      "TSFP"
    ],
    "address": "دير البلح - منطقة الغرابلي، بالقرب من مدرسة النخيل",
    "latitude": 31.421,
    "longitude": 34.358
  },
  {
    "id": "pt-20",
    "name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 5,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "مواصي خانيونس - منطقة فش فرش، شارع الكرامة الساحلي",
    "latitude": 31.339,
    "longitude": 34.271,
    "is_shared": true,
    "partner_supervisor": "هادي الأحول"
  },
  {
    "id": "pt-21",
    "name": "المغازي",
    "geo_zone": "الوسطى",
    "point_area": "المغازي",
    "supervisor": "هادي الأحول",
    "staff_count": 4,
    "programs_supported": [
      "TSFP"
    ],
    "address": "مخيم المغازي - المركز الصحي القديم، شارع السوق المركزي",
    "latitude": 31.425,
    "longitude": 34.382
  },
  {
    "id": "pt-22",
    "name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 4,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "خانيونس - حي الأمل، مركز جمعية أرض الإنسان AEI الرئيسي",
    "latitude": 31.353,
    "longitude": 34.298,
    "is_shared": true,
    "partner_supervisor": "هادي الأحول"
  },
  {
    "id": "pt-23",
    "name": "ارض الانسان جاسر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "وسط خانيونس - شارع البحر، عمارة جاسر التجارية",
    "latitude": 31.345,
    "longitude": 34.303
  },
  {
    "id": "pt-24",
    "name": "الاحبة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "القرارة - منطقة الأحبة، بالقرب من شارع صلاح الدين",
    "latitude": 31.376,
    "longitude": 34.326
  },
  {
    "id": "pt-25",
    "name": "الخير",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "خانيونس - منطقة الخير للإيواء، بالقرب من المستشفى الميداني",
    "latitude": 31.348,
    "longitude": 34.285
  },
  {
    "id": "pt-26",
    "name": "الربيع",
    "geo_zone": "خانيونس",
    "point_area": "القرارة",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "القرارة - حي الربيع، شرق طريق المطاحن القديم",
    "latitude": 31.373,
    "longitude": 34.335
  },
  {
    "id": "pt-27",
    "name": "الرمال الدهبية",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 5,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "مواصي خانيونس - منطقة الرمال الذهبية الساحلية",
    "latitude": 31.332,
    "longitude": 34.265
  },
  {
    "id": "pt-28",
    "name": "أرض الطيبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "ياسمين النجيلي",
    "staff_count": 4,
    "programs_supported": [
      "BSFP",
      "Cash"
    ],
    "address": "غرب خانيونس - منطقة أرض الطيبة، محيط مجمع ناصر الطبي",
    "latitude": 31.356,
    "longitude": 34.293
  },
  {
    "id": "pt-1-hadi",
    "name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات",
    "supervisor": "هادي الأحول",
    "staff_count": 3,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "مخيم النصيرات - شارع السوق، بالقرب من مركز البرامج النسائية",
    "latitude": 31.4485,
    "longitude": 34.3912,
    "is_shared": true,
    "partner_supervisor": "أشرف الصليبي",
    "shared_base_point_id": "pt-1"
  },
  {
    "id": "pt-14-hadi",
    "name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "هادي الأحول",
    "staff_count": 3,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "شمال غزة - حي النصر، محيط العيادة السويدية",
    "latitude": 31.534,
    "longitude": 34.456,
    "is_shared": true,
    "partner_supervisor": "براء الاسطل",
    "shared_base_point_id": "pt-14"
  },
  {
    "id": "pt-15-hadi",
    "name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة",
    "supervisor": "هادي الأحول",
    "staff_count": 3,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "غزة - حي الرمال الجنوبي، بالقرب من مكتبة وعمارة كحيل",
    "latitude": 31.515,
    "longitude": 34.448,
    "is_shared": true,
    "partner_supervisor": "براء الاسطل",
    "shared_base_point_id": "pt-15"
  },
  {
    "id": "pt-20-hadi",
    "name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "هادي الأحول",
    "staff_count": 2,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "مواصي خانيونس - منطقة فش فرش، شارع الكرامة الساحلي",
    "latitude": 31.339,
    "longitude": 34.271,
    "is_shared": true,
    "partner_supervisor": "ياسمين النجيلي",
    "shared_base_point_id": "pt-20"
  },
  {
    "id": "pt-22-hadi",
    "name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس",
    "supervisor": "هادي الأحول",
    "staff_count": 3,
    "programs_supported": [
      "TSFP",
      "BSFP",
      "Cash"
    ],
    "address": "خانيونس - حي الأمل، مركز جمعية أرض الإنسان AEI الرئيسي",
    "latitude": 31.353,
    "longitude": 34.298,
    "is_shared": true,
    "partner_supervisor": "ياسمين النجيلي",
    "shared_base_point_id": "pt-22"
  }
];


export const REAL_EMPLOYEES: RealEmployeeRecord[] = [
  {
    "national_id": "949827901",
    "full_name_ar": "أمل سمير اسماعيل عوض",
    "phone": "0599481714",
    "department": "إدارة عليا",
    "category": "منسق",
    "supervisor_name": "مديرة المشاريع",
    "point_supervisor": "إداري",
    "point_name": "إداري",
    "geo_zone": "إداري",
    "point_area": "إداري"
  },
  {
    "national_id": "402938682",
    "full_name_ar": "أشرف أسامة دياب الصليبي",
    "phone": "0598466903",
    "department": "إداري ميداني",
    "category": "مشرف",
    "supervisor_name": "أمل عوض (المنسقة)",
    "point_supervisor": "إداري",
    "point_name": "إداري",
    "geo_zone": "إداري",
    "point_area": "إداري"
  },
  {
    "national_id": "403703689",
    "full_name_ar": "براء محمد قاسم الاسطل",
    "phone": "0592238075",
    "department": "إداري ميداني",
    "category": "مشرف",
    "supervisor_name": "أمل عوض (المنسقة)",
    "point_supervisor": "إداري",
    "point_name": "إداري",
    "geo_zone": "إداري",
    "point_area": "إداري"
  },
  {
    "national_id": "411100480",
    "full_name_ar": "هادي عيسى سعيد الأحول",
    "phone": "0597828787",
    "department": "إداري ميداني",
    "category": "مشرف",
    "supervisor_name": "أمل عوض (المنسقة)",
    "point_supervisor": "إداري",
    "point_name": "إداري",
    "geo_zone": "إداري",
    "point_area": "إداري"
  },
  {
    "national_id": "402963664",
    "full_name_ar": "ياسمين مجدي محمد النجيلي",
    "phone": "0597233284",
    "department": "إداري ميداني",
    "category": "مشرف",
    "supervisor_name": "أمل عوض (المنسقة)",
    "point_supervisor": "إداري",
    "point_name": "إداري",
    "geo_zone": "إداري",
    "point_area": "إداري"
  },
  {
    "national_id": "421220104",
    "full_name_ar": "أحمد حرب علي الطويل",
    "phone": "0592507696",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "407075688",
    "full_name_ar": "لانا صلاح قدسي الوحيدي",
    "phone": "0592665365",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "403019169",
    "full_name_ar": "محمد سيد ابراهيم ابو شماله",
    "phone": "0597712731",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "400179628",
    "full_name_ar": "ياسر جهاد يونس أبو خاطر",
    "phone": "0595176949",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "420530016",
    "full_name_ar": "رهف أحمد محمد الصالحي",
    "phone": "0567160712",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "403688468",
    "full_name_ar": "احمد سامي سلامه العطار",
    "phone": "0592087997",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الحكر",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "407685163",
    "full_name_ar": "اسلام سامي سلامة العطار",
    "phone": "0595782889",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الحكر",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "404143521",
    "full_name_ar": "فاطمة بسام علي أبو بشير",
    "phone": "0567092181",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الحكر",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "407040807",
    "full_name_ar": "نهيل حمدالله عوض حمدالله",
    "phone": "0595341131",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الحكر",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "404535759",
    "full_name_ar": "أمل محمد سليمان شاهين",
    "phone": "0592247341",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الزهور",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "409757309",
    "full_name_ar": "سليمان زياد خماش",
    "phone": "0595268256",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الزهور",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "404268351",
    "full_name_ar": "محمد نعيم خليل القمع",
    "phone": "0598636319",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الزهور",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "407997428",
    "full_name_ar": "هند زياد عبدربه أبو الجديان",
    "phone": "0597667245",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "الزهور",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "801563933",
    "full_name_ar": "أسماء سليمان احمد ابو مصطفى",
    "phone": "0599167068",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "العبادلة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "405931551",
    "full_name_ar": "اماني احمد أبوزيد المجايدة",
    "phone": "0592316732",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "العبادلة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "931507057",
    "full_name_ar": "فادي محمدعبدالمنعم صدقي العبادلة",
    "phone": "0594102000",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "العبادلة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "411971153",
    "full_name_ar": "ندى فتحي حسن المغير",
    "phone": "0592091398",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "العبادلة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "406101170",
    "full_name_ar": "أمنية بسام علي أبو بشير",
    "phone": "0595671637",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "المحطة",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "408385656",
    "full_name_ar": "مؤمن عطيه سلمان ابو بليمه",
    "phone": "0592724250",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "المحطة",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "405154766",
    "full_name_ar": "مرام عبدالله توفيق الخالدي",
    "phone": "0597447393",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "المحطة",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "408098929",
    "full_name_ar": "مهند هاني محمد ضاهر",
    "phone": "0595417166",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "المحطة",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "802707299",
    "full_name_ar": "يوسف اسماعيل احمد المعني",
    "phone": "0595617424",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "المحطة",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "801810177",
    "full_name_ar": "أحمد خالد رمضان البهتيمي",
    "phone": "0599159193",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "النبراس",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "407697523",
    "full_name_ar": "لينا بسام محمود سالم ديب",
    "phone": "0595151300",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "النبراس",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "801273327",
    "full_name_ar": "هالة اسماعيل محمد شراب",
    "phone": "0599686491",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "النبراس",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "803108091",
    "full_name_ar": "هبه منير عبداللطيف المعمر",
    "phone": "0598269280",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "النبراس",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "405131574",
    "full_name_ar": "أسيل أسامه خليل أبوسعدة",
    "phone": "0598043773",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "حنين",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "903515831",
    "full_name_ar": "محمد جميل مصطفى الأسطل",
    "phone": "0599355017",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "حنين",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "400266433",
    "full_name_ar": "نجاة عبدالعاطي سالم بركة",
    "phone": "0597923987",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "حنين",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "802881151",
    "full_name_ar": "نور سمير شكري حضر",
    "phone": "0599309536",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "حنين",
    "geo_zone": "الوسطى",
    "point_area": "خانيونس"
  },
  {
    "national_id": "405138363",
    "full_name_ar": "جيهان رامي موسى أبو خاطر",
    "phone": "0592389161",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "حنين",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "803512144",
    "full_name_ar": "أنس عبد المالك عبد المؤمن غانم",
    "phone": "0597093982",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "صفا - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "403685738",
    "full_name_ar": "ايمان خالد خليل عوض",
    "phone": "0592057266",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "صفا - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "800510091",
    "full_name_ar": "سامر سمير محمد ابو عريبان",
    "phone": "0597081200",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "صفا - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "407706449",
    "full_name_ar": "حنان اسامه اسماعيل عبدالعال",
    "phone": "0595223854",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "أشرف الصليبي",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "صفا - النصيرات",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "404193849",
    "full_name_ar": "ريما عبد المجيد فضل مصلح",
    "phone": "0599107778",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو دلال",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "944820992",
    "full_name_ar": "زياد محمد حماد ابو خطاب",
    "phone": "0592890987",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو دلال",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "404599854",
    "full_name_ar": "عبدالرحمن عبدالله محمود راضي",
    "phone": "0595124172",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو دلال",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "408854875",
    "full_name_ar": "محمد فراج محمد السواركة",
    "phone": "0599960444",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو دلال",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "403809171",
    "full_name_ar": "ميسون كمال خليل بربخ",
    "phone": "0594116358",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو دلال",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "408399376",
    "full_name_ar": "بيسان عادل محمد أبو هويشل",
    "phone": "0592424809",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو معيلق",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "405848177",
    "full_name_ar": "أسيل ناصر سلمان ابو سبيخة",
    "phone": "0598293530",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو معيلق",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "800372245",
    "full_name_ar": "سعد ماضي سكران أبو معيلق",
    "phone": "0598840066",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو معيلق",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "404036014",
    "full_name_ar": "غادة أسامة محمد العدوي",
    "phone": "0592804041",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو معيلق",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "402960330",
    "full_name_ar": "محمد سعيد ماضي أبو معيلق",
    "phone": "0592585851",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "ابو معيلق",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "407666577",
    "full_name_ar": "ايه صابر احمد ابو عواد",
    "phone": "0599573682",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المخيمات المصرية",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "405156969",
    "full_name_ar": "ريهام حازم حامد ابوهاشم",
    "phone": "0595078920",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المخيمات المصرية",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "404673402",
    "full_name_ar": "سمية عبد الفتاح حسين عمر",
    "phone": "0595386109",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المخيمات المصرية",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "407054881",
    "full_name_ar": "محمد بسام إسماعيل الدوس",
    "phone": "0599687787",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المخيمات المصرية",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "803553593",
    "full_name_ar": "مهدى مجدى حسين الجوجو",
    "phone": "0592131003",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المخيمات المصرية",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "403677925",
    "full_name_ar": "أحلام أسامة عبد الرحمن عبد النبي",
    "phone": "0567588835",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المسحال",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "405162371",
    "full_name_ar": "ألاء رائد عليان نصر",
    "phone": "0592258866",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المسحال",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "407684067",
    "full_name_ar": "درين شريف حسن حسونة",
    "phone": "0597607976",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المسحال",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "403231327",
    "full_name_ar": "دينا أيمن مصباح الهندي",
    "phone": "0592890659",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المسحال",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "429504251",
    "full_name_ar": "كريم حسن إبراهيم الطيبي",
    "phone": "0599715261",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "المسحال",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "400682902",
    "full_name_ar": "أحمد فضل صبحي مرتجى",
    "phone": "0599492462",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "دوار فلسطين",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "400800421",
    "full_name_ar": "حسني يوسف خالد الدلو",
    "phone": "0592125849",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "دوار فلسطين",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "412292344",
    "full_name_ar": "نورا محمد رمضان شحادة",
    "phone": "0592798808",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "دوار فلسطين",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "404055600",
    "full_name_ar": "نوروز وسيم عطا ابو راس",
    "phone": "0595022735",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "دوار فلسطين",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "404277733",
    "full_name_ar": "سالي زكريا احمد ابو مرسة",
    "phone": "0592117619",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "دوار فلسطين",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "403751464",
    "full_name_ar": "احمد عثمان خضر عبيد",
    "phone": "0598656206",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "407866359",
    "full_name_ar": "اسيل سمير محمد راضي",
    "phone": "0567118803",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "407743830",
    "full_name_ar": "اناغيم غانم ابراهيم غانم",
    "phone": "0598492982",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "409329885",
    "full_name_ar": "خالد محمود رشيد عبد العاطي",
    "phone": "0599026916",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "405830563",
    "full_name_ar": "ليلى نضال عارف المصري",
    "phone": "0567007507",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "803295492",
    "full_name_ar": "أحمد عماد سالم كحيل",
    "phone": "0597066879",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "404529828",
    "full_name_ar": "أية نائل حسين حمد",
    "phone": "0597524948",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "404746711",
    "full_name_ar": "الاء وائل عمر النواجحة",
    "phone": "0592594135",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "800765471",
    "full_name_ar": "منال عماد سالم المجدوب",
    "phone": "0592539079",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "405907734",
    "full_name_ar": "هلا نبيل حسن السحار",
    "phone": "0594651148",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "803101245",
    "full_name_ar": "داليا نبيل عايش أحمد",
    "phone": "0595425342",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "نقطة النفق",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "925157927",
    "full_name_ar": "وليد محمود ابراهيم ابو وزنه",
    "phone": "0599020264",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "نقطة النفق",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "405455346",
    "full_name_ar": "أمل حسن سالم الشكري",
    "phone": "0599283635",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "نقطة النفق",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "406004788",
    "full_name_ar": "دينا أيمن صادق ابو جهل",
    "phone": "0593032023",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "نقطة النفق",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "402475859",
    "full_name_ar": "فداء فوزي محمد دويمه",
    "phone": "0592606718",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "براء الاسطل",
    "point_supervisor": "براء الاسطل",
    "point_name": "نقطة النفق",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "802302620",
    "full_name_ar": "خالد منصور محمد ابوعطيوي",
    "phone": "0598908698",
    "department": "علاجي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "405919564",
    "full_name_ar": "خضره حلمي سليمان ابو الكاس",
    "phone": "0592614015",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "401096664",
    "full_name_ar": "سها حسن خالد مصلح",
    "phone": "0597077577",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "أشرف الصليبي",
    "point_name": "البرامج النسائية - النصيرات",
    "geo_zone": "الوسطى",
    "point_area": "النصيرات"
  },
  {
    "national_id": "406129270",
    "full_name_ar": "إسماعيل ايمن إسماعيل ابو معيلق",
    "phone": "0599425718",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "السكة / البريج",
    "geo_zone": "الوسطى",
    "point_area": "البريج"
  },
  {
    "national_id": "402905699",
    "full_name_ar": "اروه جهاد حسن سعيد",
    "phone": "0597266067",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "السكة / البريج",
    "geo_zone": "الوسطى",
    "point_area": "البريج"
  },
  {
    "national_id": "804585859",
    "full_name_ar": "رعد وليد محمود ابو زر",
    "phone": "0598378639",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "السكة / البريج",
    "geo_zone": "الوسطى",
    "point_area": "البريج"
  },
  {
    "national_id": "800532780",
    "full_name_ar": "محمد عبد الرحيم محمد حسين علي",
    "phone": "0567984025",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "السكة / البريج",
    "geo_zone": "الوسطى",
    "point_area": "البريج"
  },
  {
    "national_id": "801226879",
    "full_name_ar": "محمد عبد الكريم صقر الاغا",
    "phone": "0599637969",
    "department": "علاجي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "الصقر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "803287457",
    "full_name_ar": "مدلين جهاد ياسين ابو طعيمة",
    "phone": "0597728442",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "الصقر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "411936347",
    "full_name_ar": "مي زكري عبد المجيد كلاب",
    "phone": "0595832134",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "الصقر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "402919674",
    "full_name_ar": "اسيل خالد اسماعيل المغاري",
    "phone": "0597107888",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "الغرابلي",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "421033648",
    "full_name_ar": "سوسن عماد سالم ابو رزق",
    "phone": "0595267903",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "الغرابلي",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "429031586",
    "full_name_ar": "عبدالله شادي فؤاد حلس",
    "phone": "0594784661",
    "department": "علاجي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "الغرابلي",
    "geo_zone": "الوسطى",
    "point_area": "دير البلح"
  },
  {
    "national_id": "405255845",
    "full_name_ar": "اسلام حسيب سليمان الصليبي",
    "phone": "0597993005",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "403290505",
    "full_name_ar": "سها عوض مرزوق ماضي",
    "phone": "0592103235",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "800777856",
    "full_name_ar": "أحمد سامي أحمد االخطيب",
    "phone": "0594479637",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "المغازي",
    "geo_zone": "الوسطى",
    "point_area": "المغازي"
  },
  {
    "national_id": "405915174",
    "full_name_ar": "ريهام محمود تيسير أبو الكاس",
    "phone": "0597741750",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "المغازي",
    "geo_zone": "الوسطى",
    "point_area": "المغازي"
  },
  {
    "national_id": "403067176",
    "full_name_ar": "عبدالرحمن محمد حسن ابو الزلف",
    "phone": "0595808442",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "المغازي",
    "geo_zone": "الوسطى",
    "point_area": "المغازي"
  },
  {
    "national_id": "420535122",
    "full_name_ar": "يوسف صبري ابراهيم الحاطي",
    "phone": "0597757638",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "هادي الأحول",
    "point_name": "المغازي",
    "geo_zone": "الوسطى",
    "point_area": "المغازي"
  },
  {
    "national_id": "800177933",
    "full_name_ar": "امارات محمد حسن ابو عبدالله",
    "phone": "0597755832",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "404641375",
    "full_name_ar": "دينا نبيل احمد ابو فودة",
    "phone": "0595698676",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "407135813",
    "full_name_ar": "عاهد حسن محمد العربشلي",
    "phone": "0595190083",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "410919906",
    "full_name_ar": "رضا فاروق ابراهيم الأشقر",
    "phone": "0595202224",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "408959989",
    "full_name_ar": "عبد الله السيع عثمان خضر عبيد",
    "phone": "0595927439",
    "department": "علاجي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "401160395",
    "full_name_ar": "هناء رائد ابراهيم ابوزور",
    "phone": "0592506259",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "براء الاسطل",
    "point_name": "سويدي النصر",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "802018093",
    "full_name_ar": "اكرام ناهض علي الأستاذ",
    "phone": "0599230941",
    "department": "علاجي",
    "category": "متطوع",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "407028448",
    "full_name_ar": "بسمة أدهم شكري الصعيدي",
    "phone": "0592746584",
    "department": "علاجي",
    "category": "موظف",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "409518529",
    "full_name_ar": "محمد رفيق مصطفى سرور",
    "phone": "0595484094",
    "department": "علاجي",
    "category": "أمن",
    "supervisor_name": "هادي الأحول",
    "point_supervisor": "براء الاسطل",
    "point_name": "كحيل",
    "geo_zone": "غزة",
    "point_area": "غزة"
  },
  {
    "national_id": "407736461",
    "full_name_ar": "روان عدنان عبدالله أبو يوسف",
    "phone": "0592029687",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "ارض الانسان جاسر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "804484558",
    "full_name_ar": "عطاف فريد محمد ابو عمر",
    "phone": "0592782831",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "ارض الانسان جاسر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "408879385",
    "full_name_ar": "فرح محمد فتحي بدر",
    "phone": "0592616033",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "ارض الانسان جاسر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "414829457",
    "full_name_ar": "نصرالله محمد نصرالله صقر",
    "phone": "0598126954",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "ارض الانسان جاسر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "405131863",
    "full_name_ar": "نورة فؤاد سلامة أبو مصطفى",
    "phone": "0592048983",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "ارض الانسان جاسر",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "802879148",
    "full_name_ar": "ياسمين شكري عبدالرحمن أبوطعيمة",
    "phone": "0599773754",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الاحبة",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "407061258",
    "full_name_ar": "افنان عبدالباسط يوسف ابوطعيمة",
    "phone": "0597838068",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الاحبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "403718554",
    "full_name_ar": "مصطفى عادل حسن الأغا",
    "phone": "0592520779",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الاحبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "803064047",
    "full_name_ar": "هديل سليمان حسين معمر",
    "phone": "0597228388",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الاحبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "404174162",
    "full_name_ar": "ولاء مراد صبحي النجار",
    "phone": "0594135530",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الاحبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "942106352",
    "full_name_ar": "احمد حسن سليم الشوبكي",
    "phone": "0592790257",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الخير",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "802680330",
    "full_name_ar": "سحر باسم عثمان العقاد",
    "phone": "0598769295",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الخير",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "409932803",
    "full_name_ar": "عبد الفتاح احمد عبد الفتاح ابو مذكور",
    "phone": "0595783269",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الخير",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "405212994",
    "full_name_ar": "علا حسن سليمان ابو جزر",
    "phone": "0595769326",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الخير",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "407126184",
    "full_name_ar": "سهيله زياد جباره الاغا",
    "phone": "0592099464",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الربيع",
    "geo_zone": "خانيونس",
    "point_area": "القرارة"
  },
  {
    "national_id": "931508527",
    "full_name_ar": "ابراهيم زياد علي النجار",
    "phone": "0566566100",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الربيع",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "804093565",
    "full_name_ar": "دعاء اسماعيل محمد القاضي",
    "phone": "0594408040",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الربيع",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "404145559",
    "full_name_ar": "ريهام ايمن علي الدده",
    "phone": "0597772772",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الربيع",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "401288105",
    "full_name_ar": "محمد وليد سلامه العقاد",
    "phone": "0592653890",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الربيع",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "403690993",
    "full_name_ar": "خلود حامد محمد أبو عرب",
    "phone": "0592197803",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الرمال الدهبية",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "406954941",
    "full_name_ar": "ريهام صالح محمود رستم",
    "phone": "0597098801",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الرمال الدهبية",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "404522674",
    "full_name_ar": "علم الدين عبد الرحمن يوسف ديب",
    "phone": "0599440733",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الرمال الدهبية",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "949836068",
    "full_name_ar": "مُكرم محمد ابراهيم عوض",
    "phone": "0599192670",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الرمال الدهبية",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "422722009",
    "full_name_ar": "يزن عوضالله إسماعيل احمد",
    "phone": "0593652281",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الرمال الدهبية",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "407186964",
    "full_name_ar": "ربا عمر سليمان قشطه",
    "phone": "0599508064",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "420262883",
    "full_name_ar": "سجى عبد الناصر خليل طبل",
    "phone": "0598043583",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "407194646",
    "full_name_ar": "شيماء عبدالفتاح يوسف طافش",
    "phone": "0598544724",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "407011410",
    "full_name_ar": "لينه نبيل حسن البشيتي",
    "phone": "0598988153",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "804743847",
    "full_name_ar": "محمود محمد شحده الشاعر",
    "phone": "0594419272",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "الكرامة - فش فرش",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "804459162",
    "full_name_ar": "أحمد كمال حسن أبوعبدالله",
    "phone": "0597970661",
    "department": "وقائي",
    "category": "أمن",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "407125210",
    "full_name_ar": "حسن غسان حسن حسونة",
    "phone": "0598416732",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "405233016",
    "full_name_ar": "ربا سعيد حمدان المصري",
    "phone": "0592087073",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "400278404",
    "full_name_ar": "ميلينا زهير محمد أبو عبدالله",
    "phone": "0598239400",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "المقر ارض الانسان (الامل)",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "800284309",
    "full_name_ar": "زينه زياد محمد النواجحه",
    "phone": "0595569880",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "أرض الطيبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "400282364",
    "full_name_ar": "محمد عبدالستار احميدان شعت",
    "phone": "0567100030",
    "department": "وقائي",
    "category": "متطوع",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "أرض الطيبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "404166381",
    "full_name_ar": "مريم ديب تيسير القيسي",
    "phone": "0592088681",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "أرض الطيبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  },
  {
    "national_id": "400159919",
    "full_name_ar": "نور الهدى زياد مطلق الداهودي",
    "phone": "0597779816",
    "department": "وقائي",
    "category": "موظف",
    "supervisor_name": "ياسمين النجيلي",
    "point_supervisor": "ياسمين النجيلي",
    "point_name": "أرض الطيبة",
    "geo_zone": "خانيونس",
    "point_area": "خانيونس"
  }
];
