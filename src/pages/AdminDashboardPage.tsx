import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  UserMinus,
  MapPin,
  Briefcase,
  Layers,
  Search,
  Filter,
  Download,
  Upload,
  ArrowUpDown,
  Eye,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  QrCode,
  Sparkles,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../lib/storageService';
import { Employee, PointAsset, LeaveRequest, ResignationRequest, WorkPoint } from '../lib/types';
import { INITIAL_WORK_POINTS } from '../lib/constants';
import { exportMultiSheetStaffBook, exportLeavesReportExcel, exportAssetsReportExcel } from '../lib/excelExport';
import { ApprovalReviewModal } from '../components/admin/ApprovalReviewModal';
import { EmployeeFullDetailsView } from '../components/admin/EmployeeFullDetailsView';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminSession, setAdminSession] = useState(storageService.getCurrentAdminSession());

  // بيانات النظام الحية
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [resignations, setResignations] = useState<ResignationRequest[]>([]);
  const [assets, setAssets] = useState<PointAsset[]>([]);

  const getSupervisorKeyword = (name?: string) => {
    if (!name) return 'ALL';
    if (name.includes('أشرف')) return 'أشرف';
    if (name.includes('براء')) return 'براء';
    if (name.includes('هادي')) return 'هادي';
    if (name.includes('ياسمين')) return 'ياسمين';
    return 'ALL';
  };

  const isSupervisor = adminSession?.user?.role === 'مشرف_ميداني';
  const defaultSupervisorFilter = isSupervisor && adminSession?.user?.name
    ? getSupervisorKeyword(adminSession.user.name)
    : 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState('ALL');
  const [selectedGov, setSelectedGov] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSupervisor, setSelectedSupervisor] = useState(defaultSupervisorFilter);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // تبويب الواجهة الإدارية: سجل الكوادر vs استعراض كافة بيانات الموظف المسجلة
  const [dashboardTab, setDashboardTab] = useState<'roster' | 'full_details'>('roster');
  const [selectedDetailEmp, setSelectedDetailEmp] = useState<Employee | null>(null);

  // حالات النوافذ المنبثقة
  const [inspectingEmployee, setInspectingEmployee] = useState<Employee | null>(null);
  const [transferringEmployee, setTransferringEmployee] = useState<Employee | null>(null);
  const [transferToPointId, setTransferToPointId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<{ added: number; updated: number; errors: string[] } | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    const emps = storageService.getAllEmployees();
    setEmployees(emps);
    setLeaves(storageService.getLeaves());
    setResignations(storageService.getResignations());
    setAssets(storageService.getAllAssets());
    if (selectedDetailEmp) {
      const updated = emps.find(e => e.national_id === selectedDetailEmp.national_id);
      if (updated) setSelectedDetailEmp(updated);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    storageService.logoutAdmin();
    setAdminSession(null);
    navigate('/login');
  };

  // إحصائيات سريعة (KPIs)
  const totalEmployees = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === 'نشط').length;
  const pendingEmployeesCount = employees.filter((e) => e.status === 'معلق_قيد_الاعتماد').length;
  const onLeaveCount = employees.filter((e) => e.status === 'مجاز').length;
  const resignedCount = employees.filter((e) => e.status === 'مستقيل').length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'معلق').length;
  const totalAssetsCount = assets.length;

  // تصفية الكوادر الميدانية بحسب كافة المعايير
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. بحث بالاسم أو الهوية أو الهاتف
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = emp.full_name_ar?.toLowerCase().includes(q);
        const matchId = emp.national_id?.includes(q);
        const matchPhone = emp.phone?.includes(q);
        if (!matchName && !matchId && !matchPhone) return false;
      }

      // 2. فلترة النقطة
      if (selectedPoint !== 'ALL') {
        if (emp.current_point_id !== selectedPoint && emp.current_point_name !== selectedPoint) {
          return false;
        }
      }

      // 3. فلترة المحافظة / المنطقة الجغرافية للنقطة
      if (selectedGov !== 'ALL') {
        const pt = INITIAL_WORK_POINTS.find((p: WorkPoint) => p.id === emp.current_point_id || p.name === emp.current_point_name);
        if (!pt || pt.geo_zone !== selectedGov) return false;
      }

      // 4. فلترة القسم / البرنامج
      if (selectedDept !== 'ALL') {
        if (selectedDept === 'علاجي' && emp.department !== 'علاجي') return false;
        if (selectedDept === 'وقائي' && emp.department !== 'وقائي') return false;
        if (selectedDept === 'كاش' && emp.department !== 'كاش' && !emp.job_title?.includes('كاش')) return false;
      }

      // 5. فلترة المشرف
      if (selectedSupervisor !== 'ALL') {
        if (!emp.supervisor_name || !emp.supervisor_name.includes(selectedSupervisor)) return false;
      }

      // 6. فلترة الحالة
      if (selectedStatus !== 'ALL') {
        if (emp.status !== selectedStatus) return false;
      }

      return true;
    });
  }, [employees, searchQuery, selectedPoint, selectedGov, selectedDept, selectedSupervisor, selectedStatus]);

  // دالة نقل الكادر بين النقاط
  const handleConfirmTransfer = () => {
    if (!transferringEmployee || !transferToPointId) return;

    const reviewer = adminSession?.user?.name || 'الإدارة المركزية';
    const result = storageService.transferEmployee(
      transferringEmployee.national_id,
      transferToPointId,
      transferReason,
      reviewer
    );

    if (result.success) {
      setToastMsg({ type: 'success', text: result.message });
      setTransferringEmployee(null);
      setTransferToPointId('');
      setTransferReason('');
      loadData();
    } else {
      setToastMsg({ type: 'error', text: result.message });
    }
  };

  // دالة معالجة رفع ملف إكسل للاستيراد الجماعي
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        // توحيد مسميات الأعمدة
        const parsed = rawJson.map((row) => ({
          national_id: String(row['رقم الهوية'] || row['الهوية'] || row['national_id'] || '').trim(),
          full_name_ar: String(row['الاسم'] || row['اسم الموظف'] || row['full_name_ar'] || '').trim(),
          phone: String(row['الهاتف'] || row['الجوال'] || row['phone'] || '').trim(),
          category: String(row['الفئة'] || row['category'] || 'موظف').trim(),
          job_title: String(row['المسمى الوظيفي'] || row['الوظيفة'] || row['job_title'] || 'كادر ميداني').trim(),
          department: String(row['القسم'] || row['department'] || 'علاجي').trim(),
          current_point_name: String(row['نقطة العمل'] || row['النقطة'] || row['point_name'] || '').trim(),
          supervisor_name: String(row['المشرف'] || row['المشرف المسؤول'] || row['supervisor_name'] || '').trim(),
          status: 'نشط'
        })).filter(r => r.national_id);

        setImportedRows(parsed);
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف الإكسل. يرجى التأكد من صيغة الملف (.xlsx أو .xls)');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (importedRows.length === 0) return;
    const res = storageService.bulkImportEmployees(importedRows);
    setImportSummary(res);
    setToastMsg({
      type: 'success',
      text: `تم اكتمال الاستيراد: ${res.added} موظف جديد، وتحديث ${res.updated} سجل.`
    });
    loadData();
    setShowImportModal(false);
    setImportedRows([]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPoint('ALL');
    setSelectedGov('ALL');
    setSelectedDept('ALL');
    setSelectedSupervisor('ALL');
    setSelectedStatus('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* شريط الترويسة العليا للمسؤول */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aei-purple to-purple-800 text-white flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">لوحة التحكم والرقابة الإدارية المركزية</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                AEI & WFP HR
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة الكوادر الميدانية الـ 145، متابعة الـ 28 نقطة تغذوية، واعتماد العمليات
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {adminSession?.user && (
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-400 block font-bold">المشغل الحالي:</span>
              <span className="text-xs font-black text-slate-800 block">{adminSession.user.name}</span>
            </div>
          )}

          <Link
            to="/admin/approvals"
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>مركز الاعتمادات</span>
            {pendingEmployeesCount + pendingLeavesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {pendingEmployeesCount + pendingLeavesCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/points"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <MapPin className="w-4 h-4 text-slate-500" />
            إدارة النقاط
          </Link>

          <Link
            to="/admin/assets"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            حصر الأصول
          </Link>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* شريط الإشعار وتوضيح الصلاحيات بحسب الدور */}
      {isSupervisor && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              نطاق الصلاحيات: تم ضبط العرض والتصفية تلقائياً على كوادر ونقاط إشرافك الميداني ({adminSession?.user.name}).
            </span>
          </div>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-black">
            صلاحيات مشرف ميداني
          </span>
        </div>
      )}

      {adminSession?.user?.role === 'منسق_مشروع' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              نطاق الصلاحيات: إشراف وتنسيق شامل لكافة الـ 28 نقطة، مع صلاحيات اعتماد الاستقالات وتعيين الكوادر البدلاء ونقل الكوادر.
            </span>
          </div>
          <span className="text-[10px] bg-blue-200 text-blue-900 px-2.5 py-0.5 rounded-full font-black">
            منسقة المشروع (إدارة عليا)
          </span>
        </div>
      )}

      {adminSession?.user?.role === 'سوبر_أدمن' && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-aei-purple shrink-0" />
            <span>
              نطاق الصلاحيات: إدارة المنظومة الشاملة، الصلاحيات الفائقة (Master Admin)، الاستيراد والتصدير، والرقابة العليا على كافة النقاط والمشرفين.
            </span>
          </div>
          <span className="text-[10px] bg-purple-200 text-purple-950 px-2.5 py-0.5 rounded-full font-black">
            سوبر أدمن (تحكم شامل)
          </span>
        </div>
      )}

      {/* رسالة التنبيه إن وجدت */}
      {toastMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          toastMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* مؤشرات الأداء الحيوية (KPIs Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. إجمالي الكوادر */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-aei-purple flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4" />
          </div>
          <span className="block text-2xl font-black text-slate-900">{totalEmployees}</span>
          <span className="text-[11px] font-bold text-slate-400">إجمالي الكوادر</span>
        </div>

        {/* 2. كوادر نشطة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="block text-2xl font-black text-emerald-600">{activeEmployeesCount}</span>
          <span className="text-[11px] font-bold text-slate-400">كوادر نشطة</span>
        </div>

        {/* 3. معلق قيد الاعتماد */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="block text-2xl font-black text-amber-600">{pendingEmployeesCount}</span>
          <span className="text-[11px] font-bold text-slate-400">معلق للاعتماد</span>
        </div>

        {/* 4. في إجازة */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="block text-2xl font-black text-blue-600">{onLeaveCount}</span>
          <span className="text-[11px] font-bold text-slate-400">في إجازة ميدانية</span>
        </div>

        {/* 5. مستقيل وبدلاء */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <UserMinus className="w-4 h-4" />
          </div>
          <span className="block text-2xl font-black text-rose-600">{resignedCount}</span>
          <span className="text-[11px] font-bold text-slate-400">مستقيل وبدلاء</span>
        </div>

        {/* 6. الأصول والعهد */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
            <Layers className="w-4 h-4" />
          </div>
          <span className="block text-2xl font-black text-slate-800">{totalAssetsCount}</span>
          <span className="text-[11px] font-bold text-slate-400">أصول وعهد AST</span>
        </div>
      </div>

      {/* شريط التبويب الإداري: سجل الكوادر والرقابة vs كافة بيانات الموظف المسجلة */}
      <div className="bg-white rounded-3xl p-2 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          onClick={() => setDashboardTab('roster')}
          className={`flex-1 py-3 px-5 rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            dashboardTab === 'roster'
              ? 'bg-gradient-to-l from-aei-purple to-purple-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>سجل الكوادر الميدانية والعمليات ({filteredEmployees.length} من أصل {totalEmployees})</span>
        </button>

        <button
          onClick={() => {
            setDashboardTab('full_details');
            if (!selectedDetailEmp && employees.length > 0) {
              setSelectedDetailEmp(employees[0]);
            }
          }}
          className={`flex-1 py-3 px-5 rounded-2xl text-xs font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            dashboardTab === 'full_details'
              ? 'bg-gradient-to-l from-aei-purple to-purple-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>كافة بيانات الموظف المسجلة (الملف الشامل 33 حقلاً)</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
            dashboardTab === 'full_details' ? 'bg-white/20 text-white' : 'bg-purple-100 text-aei-purple'
          }`}>
            استعراض ملف الكادر
          </span>
        </button>
      </div>

      {/* محتوى تبويب: استعراض كافة بيانات الموظف المسجلة (33 حقلاً) في الصفحة مباشرة */}
      {dashboardTab === 'full_details' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-aei-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  استعراض كافة بيانات الكادر المسجلة في المنظومة (33 حقلاً كاملاً)
                </h2>
                <p className="text-xs text-slate-500">
                  سجل الموظف الشامل: البيانات الشخصية، العائلية، السكن، المؤهل، التوزيع الميداني، الحساب البنكي وبطاقة الـ QR
                </p>
              </div>
            </div>

            <button
              onClick={() => setDashboardTab('roster')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-center"
            >
              <Users className="w-3.5 h-3.5" />
              العودة لجدول الكوادر
            </button>
          </div>

          <EmployeeFullDetailsView
            employee={selectedDetailEmp || employees[0]}
            allEmployees={employees}
            onSelectEmployee={(emp) => setSelectedDetailEmp(emp)}
            onApprove={(nid, name) => {
              storageService.approveEmployee(nid, `${adminSession?.user?.name || 'الإدارة المركزية'}`);
              setToastMsg({ type: 'success', text: `تم اعتماد وتفعيل الكادر (${name}) بنجاح.` });
              loadData();
            }}
            onReject={(nid, name) => {
              const reason = prompt(`الرجاء إدخال سبب الرفض أو الملاحظات المطلوبة لتعديل ملف (${name}):`);
              if (reason) {
                storageService.rejectEmployee(nid, reason);
                setToastMsg({ type: 'error', text: `تم إرجاع ملف الكادر (${name}) للمراجعة.` });
                loadData();
              }
            }}
            showSelector={true}
          />
        </div>
      )}

      {/* محتوى تبويب: سجل الكوادر والرقابة والفلاتر */}
      {dashboardTab === 'roster' && (
        <>
      {/* شريط الأدوات: تصدير إكسل متعدد الأوراق واستيراد إكسل */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-black text-slate-800">محركات التقارير والإكسل المعتمدة:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* تصدير سجل الكوادر متعدد الأوراق (Multi-Sheet) */}
          <button
            onClick={() => exportMultiSheetStaffBook(employees, resignations)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="ورقة 1: الكوادر النشطة | ورقة 2: المستقيلين والبدلاء"
          >
            <Download className="w-4 h-4" />
            تصدير مصنف الكوادر المزدوج (Excel)
          </button>

          {/* تصدير تقرير الإجازات */}
          <button
            onClick={() => exportLeavesReportExcel(leaves)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            تقرير الإجازات
          </button>

          {/* تصدير تقرير الأصول */}
          <button
            onClick={() => exportAssetsReportExcel(assets)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            تقرير العهد AST
          </button>

          {/* زر فتح استيراد إكسل */}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 rounded-xl bg-aei-purple hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            استيراد كوادر من Excel
          </button>
        </div>
      </div>

      {/* شريط الفلاتر الذكي خماسي الأبعاد */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-aei-purple" />
            <h3 className="text-xs font-black text-slate-800">
              فلترة وتصفية الكوادر الميدانية ({filteredEmployees.length} من أصل {totalEmployees})
            </h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-[11px] font-bold text-aei-purple hover:underline cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. البحث النصي */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">بحث سريع:</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الهوية، أو الجوال..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 pr-8"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* 2. فلتر النقطة */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">نقطة العمل (28 نقطة):</label>
            <select
              value={selectedPoint}
              onChange={(e) => setSelectedPoint(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 bg-white"
            >
              <option value="ALL">جميع النقاط الميدانية</option>
              {INITIAL_WORK_POINTS.map((pt: WorkPoint) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.geo_zone})
                </option>
              ))}
            </select>
          </div>

          {/* 3. فلتر المحافظة / المنطقة */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المحافظة / المنطقة:</label>
            <select
              value={selectedGov}
              onChange={(e) => setSelectedGov(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 bg-white"
            >
              <option value="ALL">كافة المحافظات</option>
              <option value="الشمال">الشمال</option>
              <option value="غزة">غزة</option>
              <option value="دير البلح">دير البلح والوسطى</option>
              <option value="خانيونس">خانيونس والمواصي</option>
              <option value="رفح">رفح</option>
            </select>
          </div>

          {/* 4. فلتر المشرف المسؤول */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">المشرف الميداني:</label>
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 bg-white"
            >
              <option value="ALL">كافة المشرفين</option>
              <option value="أشرف">أشرف أسامة الصليبي</option>
              <option value="براء">براء محمد الاسطل</option>
              <option value="هادي">هادي عيسى الأحول</option>
              <option value="ياسمين">ياسمين مجدي النجيلي</option>
            </select>
          </div>

          {/* 5. فلتر الحالة */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">الحالة الإدارية:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 bg-white"
            >
              <option value="ALL">كافة الحالات</option>
              <option value="نشط">نشط معتمد</option>
              <option value="معلق_قيد_الاعتماد">معلق قيد الاعتماد</option>
              <option value="مجاز">في إجازة</option>
              <option value="مستقيل">مستقيل</option>
            </select>
          </div>
        </div>
      </div>

      {/* جدول سجل الكوادر الميدانية المتطور */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">اسم الكادر ورقم الهوية</th>
                <th className="p-3.5">المسمى والبرنامج</th>
                <th className="p-3.5">نقطة العمل الحالية</th>
                <th className="p-3.5">المشرف الميداني</th>
                <th className="p-3.5">الهاتف</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-bold">
                    لا توجد سجلات مطابقة لمعايير البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr key={emp.national_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{emp.full_name_ar}</div>
                      <div className="text-[11px] font-mono text-slate-500">هوية: {emp.national_id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{emp.job_title}</div>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-600 mt-0.5">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{emp.current_point_name || 'غير محدد'}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {emp.supervisor_name || 'أشرف أسامة الصليبي'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600" dir="ltr">
                      {emp.phone}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        emp.status === 'نشط'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : emp.status === 'معلق_قيد_الاعتماد'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : emp.status === 'مجاز'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {emp.status === 'نشط' ? 'نشط' : emp.status === 'معلق_قيد_الاعتماد' ? 'معلق للاعتماد' : emp.status === 'مجاز' ? 'في إجازة' : 'مستقيل'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* معاينة الملف الكامل 33 حقلاً في نافذة منبثقة */}
                        <button
                          onClick={() => setInspectingEmployee(emp)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="فحص كافة بيانات الموظف (نافذة منبثقة 33 حقلاً)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* استعراض الملف الكامل 33 حقلاً في التبويب مباشرة */}
                        <button
                          onClick={() => {
                            setSelectedDetailEmp(emp);
                            setDashboardTab('full_details');
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                          title="استعراض كافة بيانات الموظف (33 حقلاً) في التبويب مباشرة"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>

                        {/* نقل كادر بين النقاط */}
                        <button
                          onClick={() => {
                            setTransferringEmployee(emp);
                            setTransferToPointId('');
                            setTransferReason('');
                          }}
                          className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-aei-purple transition-colors cursor-pointer"
                          title="نقل الكادر لنقطة أخرى"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* نافذة معاينة وفحص ملف الموظف الكامل (ApprovalReviewModal) */}
      <ApprovalReviewModal
        employee={inspectingEmployee}
        isOpen={!!inspectingEmployee}
        onClose={() => {
          setInspectingEmployee(null);
          loadData();
        }}
      />

      {/* نافذة نقل الكادر بين النقاط الميدانية */}
      {transferringEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">نقل كادر بين النقاط الميدانية</h3>
                <p className="text-xs text-slate-500">
                  للكادر: {transferringEmployee.full_name_ar} (هوية: {transferringEmployee.national_id})
                </p>
              </div>
              <button
                onClick={() => setTransferringEmployee(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">النقطة الحالية:</span>
                <span className="font-bold text-slate-800">{transferringEmployee.current_point_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">المشرف الحالي:</span>
                <span className="font-bold text-slate-800">{transferringEmployee.supervisor_name}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر نقطة العمل الجديدة (الـ 28 نقطة):
                </label>
                <select
                  value={transferToPointId}
                  onChange={(e) => setTransferToPointId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="">-- حدد النقطة المراد النقل إليها --</option>
                  {INITIAL_WORK_POINTS.filter((p: WorkPoint) => p.id !== transferringEmployee.current_point_id).map((pt: WorkPoint) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name} - مشرف النقطة: ({pt.supervisor})
                    </option>
                  ))}
                </select>
              </div>

              {transferToPointId && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                  <span className="font-bold">المشرف الذي سيتولى الإشراف بعد النقل: </span>
                  <span className="font-black">
                    {INITIAL_WORK_POINTS.find((p: WorkPoint) => p.id === transferToPointId)?.supervisor}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مبرر / سبب النقل:</label>
                <textarea
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="مقتضيات المصلحة الميدانية، تغطية عجز، إعادة توزيع الفرق..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTransferringEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={!transferToPointId}
                className="px-5 py-2 rounded-xl bg-aei-purple hover:bg-opacity-95 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                تأكيد النقل وتحديث المشرف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الاستيراد الجماعي من ملف إكسل (Bulk Excel Import Modal) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-aei-purple" />
                  استيراد كشف الكوادر الجماعي من ملف Excel
                </h3>
                <p className="text-xs text-slate-500">
                  يدعم ملفات .xlsx أو .xls بمطابقة ذكية للأعمدة (رقم الهوية، الاسم، الجوال، النقطة، المشرف، القسم)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportedRows([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* منطقة رفع الملف */}
            <div className="border-2 border-dashed border-slate-200 hover:border-aei-purple rounded-2xl p-6 text-center space-y-3 bg-slate-50/50">
              <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-aei-purple text-white text-xs font-bold inline-block shadow-sm hover:bg-opacity-95">
                  اختر ملف الإكسل من جهازك
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">الصيغ المدعومة: Microsoft Excel (.xlsx, .xls)</p>
              </div>
            </div>

            {/* معاينة السجلات المقروءة */}
            {importedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    تم قراءة ({importedRows.length}) موظف من الملف:
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    جاهز للاستيراد والتحديث
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-right text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0">
                      <tr>
                        <th className="p-2">الهوية</th>
                        <th className="p-2">الاسم</th>
                        <th className="p-2">الوظيفة</th>
                        <th className="p-2">النقطة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importedRows.slice(0, 10).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-mono">{r.national_id}</td>
                          <td className="p-2 font-bold">{r.full_name_ar}</td>
                          <td className="p-2">{r.job_title}</td>
                          <td className="p-2">{r.current_point_name || 'تلقائي'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importedRows.length > 10 && (
                  <p className="text-[10px] text-slate-400 text-center">
                    يتم عرض أول 10 سجلات من أصل {importedRows.length}...
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportedRows([]);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importedRows.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                تأكيد استيراد وتحديث السجلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
