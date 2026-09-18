// ==============================================================================
// محرك التصدير الإداري والمالي المتقدم (ExcelJS Multi-Sheet Export Engine)
// تصدير مصنف الكوادر المزدوج (النشطين + المستقيلين والبدلاء)، الإجازات، والأصول
// ==============================================================================

import ExcelJS from 'exceljs';
import { Employee, LeaveRequest, ResignationRequest, PointAsset } from './types';

/**
 * دالة مساعدة لتنزيل ملف الإكسل في المتصفح
 */
const downloadWorkbook = async (workbook: ExcelJS.Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

/**
 * 1. تصدير مصنف الكوادر الشهري المزدوج (Multi-Sheet Master Book)
 * Sheet 1: الكوادر النشطة والمعتمدة (Active Staff)
 * Sheet 2: الكوادر المستقيلة والبدلاء (Resigned & Replacements)
 */
export const exportMultiSheetStaffBook = async (
  employees: Employee[],
  resignations: ResignationRequest[] = []
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AEI_WFP_HR System';
  workbook.created = new Date();

  // --------------------------------------------------------------------------
  // Sheet 1: الكوادر النشطة والمعتمدة
  // --------------------------------------------------------------------------
  const activeSheet = workbook.addWorksheet('الكوادر النشطة والمعتمدة', {
    views: [{ rightToLeft: true }]
  });

  // الأعمدة الأساسية
  activeSheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'رقم الهوية', key: 'national_id', width: 15 },
    { header: 'الاسم رباعي (عربي)', key: 'full_name_ar', width: 30 },
    { header: 'الاسم بالإنجليزي', key: 'full_name_en', width: 25 },
    { header: 'رقم الجوال', key: 'phone', width: 16 },
    { header: 'الفئة الوظيفية', key: 'category', width: 14 },
    { header: 'المسمى الوظيفي', key: 'job_title', width: 25 },
    { header: 'القسم التابع له', key: 'department', width: 20 },
    { header: 'نقطة العمل الميدانية', key: 'point_name', width: 28 },
    { header: 'المشرف المسؤول', key: 'supervisor', width: 22 },
    { header: 'المؤهل العلمي', key: 'degree', width: 15 },
    { header: 'التخصص', key: 'major', width: 22 },
    { header: 'طريقة الدفع', key: 'payment_method', width: 18 },
    { header: 'رقم الحساب / الآيبان', key: 'iban', width: 24 },
    { header: 'العنوان الحالي', key: 'address', width: 30 },
    { header: 'الحالة', key: 'status', width: 14 }
  ];

  // تنسيق شريط العناوين الرئيسي
  const headerRow1 = activeSheet.getRow(1);
  headerRow1.height = 30;
  headerRow1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
  headerRow1.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6B1D6F' } // بنفسجي أرض الإنسان الملكي
  };
  headerRow1.alignment = { vertical: 'middle', horizontal: 'center' };

  // إضافة بيانات الكوادر النشطة
  const activeStaff = employees.filter((e) => e.status !== 'مستقيل');
  activeStaff.forEach((emp, i) => {
    const row = activeSheet.addRow({
      index: i + 1,
      national_id: emp.national_id,
      full_name_ar: emp.full_name_ar,
      full_name_en: emp.full_name_en || '-',
      phone: emp.phone,
      category: emp.category,
      job_title: emp.job_title,
      department: emp.department || '-',
      point_name: emp.current_point_name || '-',
      supervisor: emp.supervisor_name || '-',
      degree: emp.degree || '-',
      major: emp.major || '-',
      payment_method: emp.payment_method || '-',
      iban: emp.iban_or_phone || emp.bank_account || '-',
      address: emp.current_address || '-',
      status: emp.status || 'نشط'
    });

    row.height = 24;
    row.alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('index').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('national_id').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('phone').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // --------------------------------------------------------------------------
  // Sheet 2: الكوادر المستقيلة والبدلاء المعتمدين
  // --------------------------------------------------------------------------
  const resignedSheet = workbook.addWorksheet('المستقيلون والبدلاء', {
    views: [{ rightToLeft: true }]
  });

  resignedSheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'رقم هوية المستقيل', key: 'resigned_nid', width: 16 },
    { header: 'اسم الكادر المستقيل', key: 'resigned_name', width: 28 },
    { header: 'نقطة العمل السابقة', key: 'point_name', width: 25 },
    { header: 'تاريخ آخر دوام', key: 'last_date', width: 16 },
    { header: 'سبب الاستقالة', key: 'reason', width: 30 },
    { header: 'الكادر البديل المعين', key: 'replacement_name', width: 28 },
    { header: 'رقم هوية البديل', key: 'replacement_nid', width: 16 },
    { header: 'حالة إخلاء العهد', key: 'clearance', width: 16 },
    { header: 'المشرف المعتمد', key: 'reviewed_by', width: 22 },
    { header: 'حالة الطلب', key: 'status', width: 14 }
  ];

  const headerRow2 = resignedSheet.getRow(1);
  headerRow2.height = 30;
  headerRow2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
  headerRow2.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF007DBC' } // أزرق برنامج الأغذية العالمي WFP
  };
  headerRow2.alignment = { vertical: 'middle', horizontal: 'center' };

  resignations.forEach((res, i) => {
    const row = resignedSheet.addRow({
      index: i + 1,
      resigned_nid: res.national_id || res.employee_id,
      resigned_name: res.employee_name || '-',
      point_name: 'نقطة العمل الميدانية',
      last_date: res.last_working_date || '-',
      reason: res.reason_title ? `${res.reason_title}: ${res.reason_details || ''}` : '-',
      replacement_name: res.replacement_employee_name || 'بانتظار التعيين',
      replacement_nid: res.replacement_employee_id || '-',
      clearance: res.clearance_completed ? 'تم إخلاء العهد' : 'معلق / جاري الحصر',
      reviewed_by: res.reviewed_by || '-',
      status: res.status || 'معتمد'
    });

    row.height = 24;
    row.alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('index').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('resigned_nid').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('clearance').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `AEI_WFP_Staff_Master_${timestamp}.xlsx`);
};

/**
 * 2. تصدير كشف الإجازات الشهري مع الروابط التشعبية للمرفقات
 */
export const exportLeavesReportExcel = async (leaves: LeaveRequest[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('كشف الإجازات الميدانية', {
    views: [{ rightToLeft: true }]
  });

  sheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'رقم الهوية', key: 'national_id', width: 16 },
    { header: 'اسم الكادر', key: 'employee_name', width: 28 },
    { header: 'نوع الإجازة', key: 'leave_type', width: 16 },
    { header: 'تاريخ البدء', key: 'start_date', width: 15 },
    { header: 'تاريخ الانتهاء', key: 'end_date', width: 15 },
    { header: 'عدد الأيام', key: 'total_days', width: 12 },
    { header: 'التقرير الطبي المرفق', key: 'report_link', width: 26 },
    { header: 'ملاحظات الكادر', key: 'notes', width: 25 },
    { header: 'حالة الاعتماد', key: 'status', width: 16 }
  ];

  const header = sheet.getRow(1);
  header.height = 30;
  header.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E7E34' } // أخضر أرض الإنسان
  };
  header.alignment = { vertical: 'middle', horizontal: 'center' };

  leaves.forEach((lv, i) => {
    const row = sheet.addRow({
      index: i + 1,
      national_id: lv.national_id || lv.employee_id,
      employee_name: lv.employee_name || '-',
      leave_type: lv.leave_type,
      start_date: lv.start_date,
      end_date: lv.end_date,
      total_days: lv.total_days,
      report_link: lv.medical_report_url ? 'رابط التقرير الطبي' : 'لا يوجد مرفق',
      notes: lv.notes || '-',
      status: lv.status || 'معلق'
    });

    row.height = 24;
    row.alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('index').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('total_days').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };

    if (lv.medical_report_url) {
      row.getCell('report_link').value = {
        text: 'عرض التقرير الطبي 📄',
        hyperlink: lv.medical_report_url,
        tooltip: 'فتح التقرير الطبي المعتمد'
      };
      row.getCell('report_link').font = { color: { argb: 'FF0000EE' }, underline: true };
    }
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `AEI_WFP_Leaves_Report_${timestamp}.xlsx`);
};

/**
 * 3. تصدير كشف جرد الأصول والعهد الميدانية
 */
export const exportAssetsReportExcel = async (assets: PointAsset[]) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('سجل الأصول والعهد الميدانية', {
    views: [{ rightToLeft: true }]
  });

  sheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'الرقم التسلسلي', key: 'serial', width: 16 },
    { header: 'اسم الأصل والمقتنى', key: 'name', width: 30 },
    { header: 'اللون', key: 'color', width: 14 },
    { header: 'الكمية', key: 'quantity', width: 10 },
    { header: 'طبيعة العهدة', key: 'nature', width: 16 },
    { header: 'مسؤول العهدة', key: 'responsible', width: 25 },
    { header: 'هوية المسؤول', key: 'responsible_nid', width: 16 },
    { header: 'النقطة التابع لها', key: 'point_name', width: 28 },
    { header: 'حالة الأصل', key: 'condition', width: 14 },
    { header: 'المواصفات والملاحظات', key: 'specs', width: 32 }
  ];

  const header = sheet.getRow(1);
  header.height = 30;
  header.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD99A36' } // ذهبي أرض الإنسان
  };
  header.alignment = { vertical: 'middle', horizontal: 'center' };

  assets.forEach((ast, i) => {
    const row = sheet.addRow({
      index: i + 1,
      serial: ast.serial_number,
      name: ast.asset_name,
      color: ast.asset_color || '-',
      quantity: ast.quantity,
      nature: ast.custody_nature,
      responsible: ast.custody_responsible,
      responsible_nid: ast.custody_national_id || '-',
      point_name: ast.point_name,
      condition: ast.condition,
      specs: `${ast.specifications || ''} ${ast.notes ? '• ' + ast.notes : ''}`
    });

    row.height = 24;
    row.alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell('index').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('serial').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('quantity').alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell('condition').alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `AEI_WFP_Assets_Inventory_${timestamp}.xlsx`);
};
