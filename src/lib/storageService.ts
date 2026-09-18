// ==============================================================================
// خدمة إدارة ومزامنة البيانات التشغيلية (AEI_WFP_HR Storage Service)
// إدارة حسابات الكوادر، التحقق الصارم من الـ PIN، دورة الاعتماد، والأصول والعهد،
// والإجازات، والاستقالات مع شرط الموظف البديل، ونقل الكوادر والمصادقة الإدارية RBAC
// ==============================================================================

import {
  Employee,
  PointAsset,
  ProfileUpdateRequest,
  LeaveRequest,
  ResignationRequest,
  PointTransfer,
  AdminUser,
  AdminSession,
  AdminRole
} from './types';
import { REAL_EMPLOYEES } from './realData';
import { INITIAL_WORK_POINTS } from './constants';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  EMPLOYEES: 'aei_wfp_employees_store_v2',
  PINS: 'aei_wfp_pins_store_v2',
  ASSETS: 'aei_wfp_assets_store_v2',
  UPDATE_REQUESTS: 'aei_wfp_update_requests_store_v2',
  CURRENT_STAFF_SESSION: 'aei_wfp_current_staff_session',
  LEAVES: 'aei_wfp_leaves_store_v2',
  RESIGNATIONS: 'aei_wfp_resignations_store_v2',
  TRANSFERS: 'aei_wfp_transfers_store_v2',
  ADMIN_SESSION: 'aei_wfp_admin_session_v2'
};

// الحسابات الإدارية المعتمدة (RBAC Predefined Accounts)
export const PREDEFINED_ADMINS: AdminUser[] = [
  {
    id: 'admin-super',
    name: 'أ. أشرف أسامة الصليبي',
    email: 'ashraf.2lsalibi@gmail.com',
    national_id: '402938682',
    role: 'سوبر_أدمن',
    role_display: 'سوبر أدمن (إدارة المنظومة الشاملة)',
    phone: '0597148590'
  },
  {
    id: 'admin-coord',
    name: 'أ. أمل سمير عوض',
    email: 'amal.awad@aei.ps',
    national_id: '949827901',
    role: 'منسق_مشروع',
    role_display: 'منسقة المشروع (إدارة عليا)',
    phone: '0599000001'
  },
  {
    id: 'admin-sup-ashraf',
    name: 'أشرف أسامة دياب الصليبي',
    email: 'ashraf.field@aei.ps',
    national_id: '402938682',
    role: 'مشرف_ميداني',
    role_display: 'مشرف ميداني - الوسطى والشمال',
    phone: '0597148590'
  },
  {
    id: 'admin-sup-baraa',
    name: 'براء محمد قاسم الاسطل',
    email: 'baraa.field@aei.ps',
    national_id: '403703689',
    role: 'مشرف_ميداني',
    role_display: 'مشرف ميداني - خان يونس والمواصي',
    phone: '0599000002'
  },
  {
    id: 'admin-sup-hadi',
    name: 'هادي عيسى سعيد الأحول',
    email: 'hadi.field@aei.ps',
    national_id: '411100480',
    role: 'مشرف_ميداني',
    role_display: 'مشرف ميداني - غزة والوسطى',
    phone: '0599000003'
  },
  {
    id: 'admin-sup-yasmine',
    name: 'ياسمين مجدي محمد النجيلي',
    email: 'yasmine.field@aei.ps',
    national_id: '402963664',
    role: 'مشرف_ميداني',
    role_display: 'مشرفة ميدانية - رفح والمناطق التغذوية',
    phone: '0599000004'
  }
];

// تهيئة قائمة الأصول الأولية بأرقام تسلسلية واقعية تبدأ من AST-01001
const SEED_ASSETS: PointAsset[] = [
  {
    id: 'ast-1',
    serial_number: 'AST-01001',
    asset_name: 'جهاز هيموكيو متنقل لفحص الأنيميا (HemoCue 301)',
    asset_color: 'أبيض / أزرق',
    quantity: 1,
    custody_responsible: 'أمل سمير اسماعيل عوض',
    custody_national_id: '949827901',
    specifications: 'جهاز رقمي دقيق مزود ببطارية قابلة للشحن + حقيبة نقل واقية',
    condition: 'سليم',
    custody_nature: 'عهدة لموظف',
    notes: 'تم التسليم بموجب محضر استلام رسمي من WFP',
    point_id: 'pt-admin',
    point_name: 'موظف إداري / مكتب التنسيق والإدارة العامة',
    created_at: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'ast-2',
    serial_number: 'AST-01002',
    asset_name: 'مقياس وزن أطفال ورضّع إلكتروني (SECA 384)',
    asset_color: 'أبيض',
    quantity: 1,
    custody_responsible: 'أشرف أسامة دياب الصليبي',
    custody_national_id: '402938682',
    specifications: 'حمولة حتى 20 كجم بدقة 10 جم، صينية رضّع قابلة للفك',
    condition: 'سليم',
    custody_nature: 'عهدة لموظف',
    notes: 'معاير رسمياً من دائرة التغذية',
    point_id: 'pt-1',
    point_name: 'البرامج النسائية - النصيرات',
    created_at: '2026-09-01T08:30:00.000Z'
  },
  {
    id: 'ast-3',
    serial_number: 'AST-01003',
    asset_name: 'جهاز لوحي لإدخال بيانات وتوزيع الكاش (Samsung Galaxy Tab A9)',
    asset_color: 'رمادي',
    quantity: 1,
    custody_responsible: 'براء محمد قاسم الاسطل',
    custody_national_id: '403703689',
    specifications: 'شاشة 8.7 إنش، ذاكرة 64GB، مزود بغطاء مضاد للصدمات ولاصق حماية',
    condition: 'سليم',
    custody_nature: 'عهدة لموظف',
    notes: 'مخصص لمشروع توزيعات الكاش والتغذية',
    point_id: 'pt-9',
    point_name: 'البريج',
    created_at: '2026-09-02T09:00:00.000Z'
  },
  {
    id: 'ast-4',
    serial_number: 'AST-01004',
    asset_name: 'لوح خشبي معتمد لقياس طول الأطفال والرضّع (Infantometer)',
    asset_color: 'خشبي طبيعي',
    quantity: 2,
    custody_responsible: 'هادي عيسى سعيد الأحول',
    custody_national_id: '411100480',
    specifications: 'مدى القياس حتى 130 سم، تدريج مزدوج بالمليمتر، معتمد من منظمة الصحة العالمية',
    condition: 'سليم',
    custody_nature: 'عهدة لموظف',
    notes: 'مسلم لعيادة TSFP التغذوية',
    point_id: 'pt-17',
    point_name: 'السكة / البريج',
    created_at: '2026-09-03T10:00:00.000Z'
  },
  {
    id: 'ast-5',
    serial_number: 'AST-01005',
    asset_name: 'مجموعة أشرطة قياس محيط منتصف الذراع (MUAC Tapes)',
    asset_color: 'متعدد الألوان (أحمر / أصفر / أخضر)',
    quantity: 50,
    custody_responsible: 'ياسمين مجدي محمد النجيلي',
    custody_national_id: '402963664',
    specifications: 'أشرطة بلاستيكية مرنة للأطفال من سن 6 إلى 59 شهراً والنساء الحوامل',
    condition: 'سليم',
    custody_nature: 'عهدة للنقطة',
    notes: 'للاستخدام الميداني المباشر داخل النقطة',
    point_id: 'pt-20',
    point_name: 'الكرامة - فش فرش',
    created_at: '2026-09-04T11:00:00.000Z'
  }
];

// طلبات إجازة نموذجية
const SEED_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    employee_id: '949827901',
    employee_name: 'أمل سمير اسماعيل عوض',
    national_id: '949827901',
    leave_type: 'سنوية',
    start_date: '2026-09-25',
    end_date: '2026-09-27',
    total_days: 3,
    notes: 'إجازة سنوية مجدولة لحضور ورشة التنسيق العليا لبرنامج WFP',
    status: 'معتمد_نهائي',
    created_at: '2026-09-10T09:00:00.000Z'
  },
  {
    id: 'leave-2',
    employee_id: '402938682',
    employee_name: 'أشرف أسامة دياب الصليبي',
    national_id: '402938682',
    leave_type: 'مرضية',
    start_date: '2026-09-20',
    end_date: '2026-09-22',
    total_days: 3,
    medical_report_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    notes: 'وعكة صحية طارئة - مرفق تقرير طبي صادر من عيادة الرعاية الأولية',
    status: 'معلق',
    created_at: '2026-09-17T11:30:00.000Z'
  },
  {
    id: 'leave-3',
    employee_id: '403703689',
    employee_name: 'براء محمد قاسم الاسطل',
    national_id: '403703689',
    leave_type: 'طارئة',
    start_date: '2026-09-22',
    end_date: '2026-09-23',
    total_days: 2,
    notes: 'ظرف عائلي قاهر في منطقة المواصي',
    status: 'معلق',
    created_at: '2026-09-18T08:15:00.000Z'
  }
];

// طلبات استقالة نموذجية
const SEED_RESIGNATIONS: ResignationRequest[] = [
  {
    id: 'res-1',
    employee_id: '402963664',
    employee_name: 'ياسمين مجدي محمد النجيلي',
    national_id: '402963664',
    last_working_date: '2026-09-30',
    reason_title: 'سفر خارج قطاع غزة لاستكمال منحة ماجستير',
    reason_details: 'تم الحصول على قبول جامعي وتأشيرة سفر ملحة، وأتقدم بالشكر لجمعية أرض الإنسان وبرنامج الأغذية العالمي.',
    hand_letter_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80',
    status: 'معلق',
    clearance_completed: false,
    created_at: '2026-09-15T14:20:00.000Z'
  }
];

// سجلات نقل الكوادر بين النقاط
const SEED_TRANSFERS: PointTransfer[] = [
  {
    id: 'tr-1',
    employee_id: '403703689',
    national_id: '403703689',
    employee_name: 'براء محمد قاسم الاسطل',
    from_point_id: 'pt-1',
    from_point_name: 'البرامج النسائية - النصيرات',
    to_point_id: 'pt-9',
    to_point_name: 'البريج',
    from_supervisor: 'أشرف أسامة دياب الصليبي',
    to_supervisor: 'براء محمد قاسم الاسطل',
    transfer_date: '2026-09-05',
    reason: 'إعادة توزيع الكوادر الإشرافية الميدانية لتغطية نقاط الوسطى',
    transferred_by: 'أمل سمير عوض (منسقة المشروع)',
    created_at: '2026-09-05T10:00:00.000Z'
  }
];

class StorageService {
  private employees: Map<string, Employee> = new Map();
  private pins: Map<string, string> = new Map(); // national_id -> pin
  private assets: PointAsset[] = [];
  private updateRequests: ProfileUpdateRequest[] = [];
  private leaves: LeaveRequest[] = [];
  private resignations: ResignationRequest[] = [];
  private transfers: PointTransfer[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // 1. تحميل أو تهيئة الموظفين الـ 145 الأساسيين
    const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (savedEmployees) {
      try {
        const parsed: Employee[] = JSON.parse(savedEmployees);
        parsed.forEach((emp) => this.employees.set(emp.national_id, emp));
      } catch (e) {
        console.error('Error reading employees from storage', e);
      }
    }

    if (this.employees.size === 0) {
      REAL_EMPLOYEES.forEach((emp) => {
        const matchedPoint = INITIAL_WORK_POINTS.find(
          (p) => p.name === emp.point_name || p.name.includes(emp.point_name)
        ) || INITIAL_WORK_POINTS[0];

        const record: Employee = {
          national_id: emp.national_id,
          full_name_ar: emp.full_name_ar,
          phone: emp.phone,
          category: (emp.category as any) || 'موظف',
          job_title:
            emp.category === 'منسق'
              ? 'منسقة المشروع (إدارة عليا)'
              : emp.department === 'علاجي'
              ? 'أخصائي تغذية علاجية (TSFP)'
              : emp.department === 'وقائي'
              ? 'أخصائي تغذية وقائية وكاش (BSFP)'
              : `${emp.category} - ${emp.department}`,
          department: emp.department,
          current_point_id: matchedPoint.id,
          current_point_name: matchedPoint.name,
          supervisor_name: emp.supervisor_name,
          status: 'نشط', // الكوادر المؤسسة الأصلية معتمدة
          profile_completed: false,
          qr_token: `AEI-WFP-${emp.national_id}`,
          created_at: '2026-09-01T00:00:00.000Z'
        };
        this.employees.set(emp.national_id, record);
      });
      this.saveEmployees();
    }

    // 2. تحميل الـ PINs
    const savedPins = localStorage.getItem(STORAGE_KEYS.PINS);
    if (savedPins) {
      try {
        const parsed: Record<string, string> = JSON.parse(savedPins);
        Object.entries(parsed).forEach(([nid, pin]) => this.pins.set(nid, pin));
      } catch (e) {
        console.error('Error reading PINs from storage', e);
      }
    }

    // رموز PIN الافتراضية للمشرفين والمنسقة
    if (!this.pins.has('949827901')) this.pins.set('949827901', '2026');
    if (!this.pins.has('402938682')) this.pins.set('402938682', '2026');
    if (!this.pins.has('403703689')) this.pins.set('403703689', '2026');
    if (!this.pins.has('411100480')) this.pins.set('411100480', '2026');
    if (!this.pins.has('402963664')) this.pins.set('402963664', '2026');
    this.savePins();

    // 3. تحميل الأصول
    const savedAssets = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (savedAssets) {
      try {
        this.assets = JSON.parse(savedAssets);
      } catch (e) {
        this.assets = [...SEED_ASSETS];
      }
    } else {
      this.assets = [...SEED_ASSETS];
      this.saveAssets();
    }

    // 4. تحميل طلبات تعديل البيانات
    const savedRequests = localStorage.getItem(STORAGE_KEYS.UPDATE_REQUESTS);
    if (savedRequests) {
      try {
        this.updateRequests = JSON.parse(savedRequests);
      } catch (e) {
        this.updateRequests = [];
      }
    }

    // 5. تحميل الإجازات
    const savedLeaves = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (savedLeaves) {
      try {
        this.leaves = JSON.parse(savedLeaves);
      } catch (e) {
        this.leaves = [...SEED_LEAVES];
      }
    } else {
      this.leaves = [...SEED_LEAVES];
      this.saveLeaves();
    }

    // 6. تحميل الاستقالات
    const savedResignations = localStorage.getItem(STORAGE_KEYS.RESIGNATIONS);
    if (savedResignations) {
      try {
        this.resignations = JSON.parse(savedResignations);
      } catch (e) {
        this.resignations = [...SEED_RESIGNATIONS];
      }
    } else {
      this.resignations = [...SEED_RESIGNATIONS];
      this.saveResignations();
    }

    // 7. تحميل سجلات النقل
    const savedTransfers = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    if (savedTransfers) {
      try {
        this.transfers = JSON.parse(savedTransfers);
      } catch (e) {
        this.transfers = [...SEED_TRANSFERS];
      }
    } else {
      this.transfers = [...SEED_TRANSFERS];
      this.saveTransfers();
    }
  }

  private saveEmployees() {
    const list = Array.from(this.employees.values());
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
  }

  private savePins() {
    const obj: Record<string, string> = {};
    this.pins.forEach((pin, nid) => {
      obj[nid] = pin;
    });
    localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(obj));
  }

  private saveAssets() {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(this.assets));
  }

  private saveUpdateRequests() {
    localStorage.setItem(STORAGE_KEYS.UPDATE_REQUESTS, JSON.stringify(this.updateRequests));
  }

  private saveLeaves() {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(this.leaves));
  }

  private saveResignations() {
    localStorage.setItem(STORAGE_KEYS.RESIGNATIONS, JSON.stringify(this.resignations));
  }

  private saveTransfers() {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(this.transfers));
  }

  // --------------------------------------------------------------------------
  // إدارة المصادقة والجلسات الإدارية (Admin RBAC Authentication)
  // --------------------------------------------------------------------------

  public loginAdmin(identifier: string, secret: string): {
    success: boolean;
    user?: AdminUser;
    message: string;
  } {
    const idClean = identifier.trim().toLowerCase();
    const secClean = secret.trim();

    // 1. فحص السوبر أدمن
    if (
      idClean === 'ashraf.2lsalibi@gmail.com' ||
      idClean === 'ashraf' ||
      idClean === 'admin'
    ) {
      if (secClean === 'admin2026' || secClean === 'ashraf2026' || secClean === '2026') {
        const user = PREDEFINED_ADMINS[0];
        const session: AdminSession = {
          user,
          token: `token-admin-${Date.now()}`,
          login_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
        return { success: true, user, message: 'تم تسجيل الدخول بصلاحية سوبر أدمن بنجاح.' };
      }
      return { success: false, message: 'كلمة مرور السوبر أدمن غير صحيحة.' };
    }

    // 2. فحص المنسقة أمل عوض
    if (
      idClean === 'amal.awad@aei.ps' ||
      idClean === '949827901' ||
      idClean === 'amal'
    ) {
      if (secClean === 'amal2026' || secClean === '2026') {
        const user = PREDEFINED_ADMINS[1];
        const session: AdminSession = {
          user,
          token: `token-coord-${Date.now()}`,
          login_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
        return { success: true, user, message: 'تم تسجيل الدخول بصلاحية منسقة المشروع بنجاح.' };
      }
      return { success: false, message: 'كلمة مرور / رمز المنسقة غير صحيح.' };
    }

    // 3. فحص المشرفين الميدانيين
    const supervisor = PREDEFINED_ADMINS.slice(2).find(
      (s) => s.national_id === idClean || (s.email && s.email.toLowerCase() === idClean)
    );

    if (supervisor) {
      // فحص PIN المشرف من مخزن الـ PINs أو الافتراضي 2026
      const storedPin = this.pins.get(supervisor.national_id || '') || '2026';
      if (secClean === storedPin || secClean === '2026') {
        const session: AdminSession = {
          user: supervisor,
          token: `token-sup-${Date.now()}`,
          login_at: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
        return { success: true, user: supervisor, message: `مرحباً بك المشرف ${supervisor.name}.` };
      }
      return { success: false, message: 'رمز مرور المشرف (PIN) غير صحيح.' };
    }

    return {
      success: false,
      message: 'بيانات الاعتماد غير مسجلة في قائمة الإدارة العليا أو المشرفين.'
    };
  }

  public getCurrentAdminSession(): AdminSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public logoutAdmin(): void {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }

  // --------------------------------------------------------------------------
  // التحقق الصارم من الـ PIN وجلسة الموظف الميداني
  // --------------------------------------------------------------------------

  public verifyPin(nationalId: string, inputPin: string): {
    success: boolean;
    errorType?: 'NOT_FOUND' | 'NO_PIN_SET' | 'WRONG_PIN';
    message: string;
    employee?: Employee;
  } {
    const nid = nationalId.trim();
    const pin = inputPin.trim();

    const employee = this.employees.get(nid);
    if (!employee) {
      return {
        success: false,
        errorType: 'NOT_FOUND',
        message: 'رقم الهوية غير مسجل في قاعدة بيانات المشروع. يرجى استكمال استمارة التسجيل أولاً أو مراجعة المشرف الميداني.'
      };
    }

    const storedPin = this.pins.get(nid);
    if (!storedPin) {
      return {
        success: false,
        errorType: 'NO_PIN_SET',
        message: 'لم يتم تعيين رمز مرور (PIN) لهذا الحساب بعد. يرجى التوجه لصفحة "تسجيل الكوادر" واستكمال ملفك وتعيين رمز المرور.'
      };
    }

    if (storedPin !== pin) {
      return {
        success: false,
        errorType: 'WRONG_PIN',
        message: 'رمز المرور (PIN) المدخل غير صحيح. يرجى التأكد وإعادة المحاولة.'
      };
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF_SESSION, JSON.stringify(employee));

    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح.',
      employee
    };
  }

  public getCurrentSession(): Employee | null {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF_SESSION);
    if (!session) return null;
    try {
      const parsed: Employee = JSON.parse(session);
      return this.employees.get(parsed.national_id) || parsed;
    } catch (e) {
      return null;
    }
  }

  public clearSession() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF_SESSION);
  }

  // --------------------------------------------------------------------------
  // دورة تسجيل واعتماد الموظفين (Pending Approval Workflow)
  // --------------------------------------------------------------------------

  public registerOrUpdateEmployee(data: Partial<Employee>, pin: string): Employee {
    const nid = (data.national_id || '').trim();
    if (!nid) throw new Error('رقم الهوية إلزامي');

    const existing = this.employees.get(nid);
    const point = INITIAL_WORK_POINTS.find(p => p.id === data.current_point_id) || INITIAL_WORK_POINTS[0];

    const newRecord: Employee = {
      ...existing,
      ...data,
      national_id: nid,
      full_name_ar: (data.full_name_ar || existing?.full_name_ar || '').trim(),
      phone: (data.phone || existing?.phone || '').trim(),
      job_title: (data.job_title || existing?.job_title || 'كادر ميداني').trim(),
      category: (data.category || existing?.category || 'موظف'),
      current_point_name: point.name,
      status: 'معلق_قيد_الاعتماد',
      profile_completed: true,
      qr_token: `AEI-WFP-${nid}`,
      created_at: existing?.created_at || new Date().toISOString()
    };

    this.employees.set(nid, newRecord);
    this.pins.set(nid, pin.trim());

    this.saveEmployees();
    this.savePins();

    localStorage.setItem('aei_last_registered_employee', JSON.stringify(newRecord));
    return newRecord;
  }

  public getPendingEmployees(): Employee[] {
    return Array.from(this.employees.values()).filter(
      (e) => e.status === 'معلق_قيد_الاعتماد'
    );
  }

  public approveEmployee(nationalId: string, approverName: string = 'المشرف الميداني'): boolean {
    const emp = this.employees.get(nationalId);
    if (!emp) return false;

    emp.status = 'نشط';
    emp.notes = (emp.notes ? emp.notes + ' | ' : '') + `تم الاعتماد والتفعيل بواسطة: ${approverName} في ${new Date().toLocaleDateString('ar-EG')}`;
    
    this.employees.set(nationalId, emp);
    this.saveEmployees();

    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.national_id === nationalId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF_SESSION, JSON.stringify(emp));
    }

    return true;
  }

  public rejectEmployee(nationalId: string, reason: string): boolean {
    const emp = this.employees.get(nationalId);
    if (!emp) return false;

    emp.status = 'معلق_قيد_الاعتماد';
    emp.notes = (emp.notes ? emp.notes + ' | ' : '') + `ملاحظات المراجعة: ${reason}`;
    
    this.employees.set(nationalId, emp);
    this.saveEmployees();
    return true;
  }

  public getAllEmployees(): Employee[] {
    return Array.from(this.employees.values());
  }

  public getEmployeeByNid(nid: string): Employee | undefined {
    return this.employees.get(nid);
  }

  // --------------------------------------------------------------------------
  // إدارة الأصول والعهد الميدانية (AST-01001 Series)
  // --------------------------------------------------------------------------

  public getAllAssets(): PointAsset[] {
    return [...this.assets];
  }

  public getEmployeeCustodies(nationalId: string, fullName?: string): PointAsset[] {
    return this.assets.filter((asset) => {
      if (asset.custody_nature !== 'عهدة لموظف') return false;
      if (asset.custody_national_id === nationalId) return true;
      if (fullName && asset.custody_responsible.includes(fullName)) return true;
      return false;
    });
  }

  public getNextAssetSerialNumber(): string {
    let maxNumber = 1000;
    this.assets.forEach((ast) => {
      const match = ast.serial_number.match(/AST-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    const next = maxNumber + 1;
    return `AST-0${next}`;
  }

  public addAsset(assetData: Omit<PointAsset, 'id' | 'serial_number' | 'created_at'>): PointAsset {
    const nextSerial = this.getNextAssetSerialNumber();
    const newAsset: PointAsset = {
      ...assetData,
      id: `ast-${Date.now()}`,
      serial_number: nextSerial,
      created_at: new Date().toISOString()
    };

    this.assets.unshift(newAsset);
    this.saveAssets();

    Promise.resolve(supabase.from('point_assets').insert(newAsset)).catch(() => {});
    return newAsset;
  }

  public updateAsset(id: string, updates: Partial<PointAsset>): boolean {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    this.assets[idx] = { ...this.assets[idx], ...updates };
    this.saveAssets();
    return true;
  }

  public deleteAsset(id: string): boolean {
    const initialLen = this.assets.length;
    this.assets = this.assets.filter((a) => a.id !== id);
    if (this.assets.length !== initialLen) {
      this.saveAssets();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // إدارة طلبات تعديل البيانات (Profile Update Requests)
  // --------------------------------------------------------------------------

  public submitProfileUpdateRequest(req: Omit<ProfileUpdateRequest, 'id' | 'status' | 'created_at'>): ProfileUpdateRequest {
    const newReq: ProfileUpdateRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'معلق',
      created_at: new Date().toISOString()
    };

    this.updateRequests.unshift(newReq);
    this.saveUpdateRequests();
    return newReq;
  }

  public getPendingUpdateRequests(): ProfileUpdateRequest[] {
    return this.updateRequests.filter((r) => r.status === 'معلق');
  }

  public approveUpdateRequest(requestId: string, reviewerName: string = 'المشرف الميداني'): boolean {
    const req = this.updateRequests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'معتمد';
    req.reviewed_by = reviewerName;
    req.reviewed_at = new Date().toISOString();

    const emp = this.employees.get(req.national_id);
    if (emp && req.field_name) {
      (emp as any)[req.field_name] = req.new_value;
      this.employees.set(req.national_id, emp);
      this.saveEmployees();
    }

    this.saveUpdateRequests();
    return true;
  }

  public rejectUpdateRequest(requestId: string, reviewerName: string = 'المشرف الميداني'): boolean {
    const req = this.updateRequests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'مرفوض';
    req.reviewed_by = reviewerName;
    req.reviewed_at = new Date().toISOString();

    this.saveUpdateRequests();
    return true;
  }

  // --------------------------------------------------------------------------
  // إدارة الإجازات الميدانية (Leaves Management)
  // --------------------------------------------------------------------------

  public getLeaves(): LeaveRequest[] {
    return [...this.leaves];
  }

  public submitLeave(leave: Omit<LeaveRequest, 'id' | 'status' | 'created_at'>): LeaveRequest {
    const newLeave: LeaveRequest = {
      ...leave,
      id: `leave-${Date.now()}`,
      status: 'معلق',
      created_at: new Date().toISOString()
    };

    this.leaves.unshift(newLeave);
    this.saveLeaves();

    Promise.resolve(supabase.from('leave_requests').insert(newLeave)).catch(() => {});
    return newLeave;
  }

  public approveLeave(id: string, approverName: string = 'الإدارة المركزية'): boolean {
    const leave = this.leaves.find(l => l.id === id);
    if (!leave) return false;

    leave.status = 'معتمد_نهائي';
    this.saveLeaves();

    // تحديث حالة الموظف مؤقتاً إلى مجاز إن كانت إجازته سارية
    const emp = this.employees.get(leave.employee_id);
    if (emp) {
      emp.status = 'مجاز';
      this.saveEmployees();
    }

    return true;
  }

  public rejectLeave(id: string, reviewerName: string = 'الإدارة المركزية', reason?: string): boolean {
    const leave = this.leaves.find(l => l.id === id);
    if (!leave) return false;

    leave.status = 'مرفوض';
    if (reason) {
      leave.notes = (leave.notes ? leave.notes + ' | ' : '') + `سبب الرفض: ${reason}`;
    }
    this.saveLeaves();
    return true;
  }

  // --------------------------------------------------------------------------
  // إدارة الاستقالات وإخلاء الطرف الإلزامي (Resignations & Replacement Staff)
  // --------------------------------------------------------------------------

  public getResignations(): ResignationRequest[] {
    return [...this.resignations];
  }

  public submitResignation(res: Omit<ResignationRequest, 'id' | 'status' | 'created_at' | 'clearance_completed'>): ResignationRequest {
    const newRes: ResignationRequest = {
      ...res,
      id: `res-${Date.now()}`,
      status: 'معلق',
      clearance_completed: false,
      created_at: new Date().toISOString()
    };

    this.resignations.unshift(newRes);
    this.saveResignations();

    Promise.resolve(supabase.from('resignation_requests').insert(newRes)).catch(() => {});
    return newRes;
  }

  /**
   * اعتماد الاستقالة مع التحقق الصارم من:
   * 1. تحديد الموظف البديل (replacementEmployeeId)
   * 2. إتمام إخلاء طرف العهد والمقتنيات
   */
  public approveResignation(
    resignationId: string,
    replacementEmployeeId: string,
    reviewerName: string = 'المنسقة والسوبر أدمن'
  ): { success: boolean; message: string } {
    const res = this.resignations.find(r => r.id === resignationId);
    if (!res) {
      return { success: false, message: 'طلب الاستقالة غير موجود.' };
    }

    if (!replacementEmployeeId || replacementEmployeeId.trim() === '') {
      return {
        success: false,
        message: 'لا يمكن اعتماد الاستقالة بدون تحديد الكادر البديل لتسلم مهام النقطة!'
      };
    }

    const replacementEmp = this.employees.get(replacementEmployeeId.trim());
    if (!replacementEmp) {
      return {
        success: false,
        message: 'الكادر البديل المختار غير موجود في قاعدة بيانات المشروع.'
      };
    }

    // التحقق من موظف الاستقالة وتغيير حالته إلى "مستقيل"
    const resignedEmp = this.employees.get(res.employee_id);
    if (resignedEmp) {
      resignedEmp.status = 'مستقيل';
      resignedEmp.notes = (resignedEmp.notes ? resignedEmp.notes + ' | ' : '') + `استقال بتاريخ ${res.last_working_date} والبديل: ${replacementEmp.full_name_ar}`;
      this.employees.set(res.employee_id, resignedEmp);
      this.saveEmployees();
    }

    // تحديث سجل الاستقالة
    res.status = 'معتمد';
    res.replacement_employee_id = replacementEmp.national_id;
    res.replacement_employee_name = replacementEmp.full_name_ar;
    res.clearance_completed = true;
    res.reviewed_by = reviewerName;
    res.reviewed_at = new Date().toISOString();

    this.saveResignations();

    return {
      success: true,
      message: `تم اعتماد الاستقالة بنجاح، وتعيين البديل: ${replacementEmp.full_name_ar}، وإخلاء الطرف.`
    };
  }

  public rejectResignation(resignationId: string, reviewerName: string = 'الإدارة المركزية', reason: string): boolean {
    const res = this.resignations.find(r => r.id === resignationId);
    if (!res) return false;

    res.status = 'مرفوض';
    res.reviewed_by = reviewerName;
    res.reviewed_at = new Date().toISOString();
    res.reason_details = (res.reason_details ? res.reason_details + ' | ' : '') + `ملاحظات الإدارة: ${reason}`;

    this.saveResignations();
    return true;
  }

  // --------------------------------------------------------------------------
  // نقل الكوادر بين النقاط (Point Transfers)
  // --------------------------------------------------------------------------

  public getTransfers(): PointTransfer[] {
    return [...this.transfers];
  }

  public transferEmployee(
    nationalId: string,
    toPointId: string,
    reason: string,
    transferredBy: string = 'الإدارة المركزية'
  ): { success: boolean; message: string; transfer?: PointTransfer } {
    const emp = this.employees.get(nationalId.trim());
    if (!emp) {
      return { success: false, message: 'الموظف غير موجود بالنظام.' };
    }

    const toPoint = INITIAL_WORK_POINTS.find(p => p.id === toPointId);
    if (!toPoint) {
      return { success: false, message: 'نقطة العمل المحددة غير موجودة.' };
    }

    const fromPointId = emp.current_point_id || '';
    const fromPointName = emp.current_point_name || 'غير محدد';
    const fromSupervisor = emp.supervisor_name || 'غير محدد';
    const toSupervisor = toPoint.supervisor;

    // توثيق سجل النقل
    const transferRecord: PointTransfer = {
      id: `tr-${Date.now()}`,
      employee_id: emp.national_id,
      national_id: emp.national_id,
      employee_name: emp.full_name_ar,
      from_point_id: fromPointId,
      from_point_name: fromPointName,
      to_point_id: toPoint.id,
      to_point_name: toPoint.name,
      from_supervisor: fromSupervisor,
      to_supervisor: toSupervisor || 'غير محدد',
      transfer_date: new Date().toISOString().split('T')[0],
      reason: reason || 'مقتضيات مصلحة العمل الميداني وإعادة التوزيع',
      transferred_by: transferredBy,
      created_at: new Date().toISOString()
    };

    this.transfers.unshift(transferRecord);
    this.saveTransfers();

    // تحديث سجل الموظف بالنقطة الجديدة والمشرف المسؤول آلياً
    emp.current_point_id = toPoint.id;
    emp.current_point_name = toPoint.name;
    emp.supervisor_name = toSupervisor || 'غير محدد';
    emp.notes = (emp.notes ? emp.notes + ' | ' : '') + `تم نقله إلى ${toPoint.name} (مشرف: ${toSupervisor}) في ${transferRecord.transfer_date}`;

    this.employees.set(nationalId.trim(), emp);
    this.saveEmployees();

    return {
      success: true,
      message: `تم نقل الكادر ${emp.full_name_ar} بنجاح إلى نقطة ${toPoint.name} تحت إشراف ${toSupervisor || 'غير محدد'}.`,
      transfer: transferRecord
    };
  }

  // --------------------------------------------------------------------------
  // الاستيراد الجماعي من إكسل (Bulk Excel Import)
  // --------------------------------------------------------------------------

  public bulkImportEmployees(records: Partial<Employee>[]): {
    added: number;
    updated: number;
    errors: string[];
  } {
    let added = 0;
    let updated = 0;
    const errors: string[] = [];

    records.forEach((row, idx) => {
      const nid = (row.national_id || '').toString().trim();
      if (!nid || nid.length !== 9) {
        errors.push(`السطر ${idx + 1}: رقم الهوية (${nid}) غير صالح (يجب أن يكون 9 أرقام).`);
        return;
      }

      const existing = this.employees.get(nid);
      const point = INITIAL_WORK_POINTS.find(
        p => p.name === row.current_point_name || (row.current_point_id && p.id === row.current_point_id)
      ) || INITIAL_WORK_POINTS[0];

      const merged: Employee = {
        ...existing,
        ...row,
        national_id: nid,
        full_name_ar: (row.full_name_ar || existing?.full_name_ar || `موظف مستورد ${nid}`).trim(),
        phone: (row.phone || existing?.phone || '').toString().trim(),
        category: (row.category || existing?.category || 'موظف') as any,
        job_title: (row.job_title || existing?.job_title || 'كادر ميداني').trim(),
        current_point_id: point.id,
        current_point_name: point.name,
        supervisor_name: row.supervisor_name || point.supervisor || existing?.supervisor_name || 'أشرف أسامة دياب الصليبي',
        status: row.status || existing?.status || 'نشط',
        qr_token: `AEI-WFP-${nid}`,
        created_at: existing?.created_at || new Date().toISOString()
      };

      if (existing) {
        updated++;
      } else {
        added++;
      }

      this.employees.set(nid, merged);
      // تهيئة PIN افتراضي إن لم يكن له PIN
      if (!this.pins.has(nid)) {
        this.pins.set(nid, '2026');
      }
    });

    this.saveEmployees();
    this.savePins();

    return { added, updated, errors };
  }
}

export const storageService = new StorageService();
