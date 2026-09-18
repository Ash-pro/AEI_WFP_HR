export type JobCategory = 'موظف' | 'متطوع' | 'أمن' | 'منسق' | string;
export type MaritalStatus = 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل';
export type EducationDegree = 'إعدادي' | 'ثانوي' | 'دبلوم' | 'بكالوريوس' | 'ماجستير' | 'دكتوراه';
export type HousingType = 'ملك' | 'إيجار' | 'نزوح - مدرسة إيواء' | 'نزوح - خيمة' | 'استضافة لدى أقارب' | 'أخرى';
export type PaymentMethod = 'حساب بنك فلسطين' | 'كود جوال باي / محفظة' | 'حوالة نقدية أخرى';
export type LeaveType = 'سنوية' | 'طبية' | 'مرضية' | 'طارئة' | 'أمومة' | 'أخرى';
export type ProgramType = 'TSFP' | 'BSFP' | 'Cash' | 'BSFP_Cash';
export type PointStatus = 'نشطة' | 'معلقة_مؤقتاً' | 'مغلقة';

export interface WorkPoint {
  id: string;
  name: string;
  governorate: string;
  geo_zone?: string;
  address_details: string;
  latitude?: number;
  longitude?: number;
  programs_supported: string[];
  is_active: boolean;
  status?: PointStatus;
  status_reason?: string;
  status_updated_at?: string;
  status_updated_by?: string;
  supervisor?: string;
  supervisor_name?: string;
  point_area?: string;
  staff_count?: number;
  notes?: string;
  is_shared?: boolean;
  partner_supervisor?: string;
  shared_base_point_id?: string;
}

export interface PointTeam {
  id: string;
  point_id: string;
  team_name: string;
  program: ProgramType;
  supervisor_id?: string;
  supervisor_name?: string;
}

export interface Employee {
  id?: string;
  national_id: string;
  pin?: string;
  qr_token?: string;
  full_name_ar: string;
  full_name_en?: string;
  birth_date?: string;
  marital_status?: MaritalStatus;
  family_count?: number;
  children_under_5?: number;
  phone: string;
  email?: string;
  category?: JobCategory;
  job_title: string;
  department?: string;
  current_point_id?: string;
  current_point_name?: string;
  point_name?: string;
  current_team_id?: string;
  supervisor_id?: string;
  supervisor_name?: string;
  degree?: EducationDegree;
  major?: string;
  graduation_year?: string;
  university?: string;
  university_other?: string;
  license_number?: string;
  license_date?: string;
  current_gov?: string;
  current_address?: string;
  housing_type?: HousingType;
  prewar_gov?: string;
  prewar_address?: string;
  payment_method?: PaymentMethod;
  iban_or_phone?: string;
  bank_account?: string;
  bank_branch?: string;
  photo_url?: string;
  id_card_url?: string;
  notes?: string;
  declaration_agreed?: boolean;
  profile_completed?: boolean;
  status?: 'معلق_قيد_الاعتماد' | 'نشط' | 'مجاز' | 'مستقيل' | 'منقول';
  created_at?: string;
}

export interface LeaveRequest {
  id?: string;
  employee_id: string;
  employee_name?: string;
  national_id?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  medical_report_url?: string;
  notes?: string;
  status?: 'معلق' | 'معتمد_مشرف' | 'معتمد_نهائي' | 'مرفوض';
  created_at?: string;
}

export interface ResignationRequest {
  id?: string;
  employee_id: string;
  employee_name?: string;
  national_id?: string;
  last_working_date: string;
  reason_title: string;
  reason_details: string;
  hand_letter_url: string;
  status?: 'معلق' | 'معتمد' | 'مرفوض';
  replacement_employee_id?: string;
  replacement_employee_name?: string;
  clearance_completed?: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface PointTransfer {
  id: string;
  employee_id: string;
  national_id: string;
  employee_name: string;
  from_point_id: string;
  from_point_name: string;
  to_point_id: string;
  to_point_name: string;
  from_supervisor: string;
  to_supervisor: string;
  transfer_date: string;
  reason?: string;
  transferred_by: string;
  created_at: string;
}

export interface PointAsset {
  id: string;
  serial_number: string; // AST-01001
  asset_name: string;
  asset_color?: string;
  quantity: number;
  custody_responsible: string; // مسؤول العهدة
  custody_national_id?: string;
  specifications?: string;
  condition: 'سليم' | 'معطوب' | 'تالف' | 'أخرى';
  custody_nature: 'عهدة لموظف' | 'عهدة للنقطة';
  notes?: string;
  point_id: string;
  point_name: string; // اسم النقطة أو "لموظف إداري"
  created_at?: string;
}

export interface ProfileUpdateRequest {
  id: string;
  employee_id: string;
  national_id: string;
  employee_name: string;
  field_name: string;
  field_label_ar: string;
  old_value: string;
  new_value: string;
  reason?: string;
  status: 'معلق' | 'معتمد' | 'مرفوض';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export type AdminRole = 'سوبر_أدمن' | 'منسق_مشروع' | 'مشرف_ميداني';

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  national_id?: string;
  role: AdminRole;
  role_display: string;
  phone?: string;
  assigned_points?: string[];
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  login_at: string;
}

