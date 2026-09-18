import React, { useState } from 'react';
import { storageService } from '../lib/storageService';
import { PointAsset } from '../lib/types';
import { INITIAL_WORK_POINTS } from '../lib/constants';
import { 
  Package, Plus, Search, Filter, Trash2, Edit2, 
  CheckCircle2, AlertCircle, Building2, User, 
  Briefcase, Tag, Sparkles, X
} from 'lucide-react';

export const AssetsManagementPage: React.FC = () => {
  const [assets, setAssets] = useState<PointAsset[]>(() => storageService.getAllAssets());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPoint, setFilterPoint] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterNature, setFilterNature] = useState('all');

  // New Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [nextSerial, setNextSerial] = useState(() => storageService.getNextAssetSerialNumber());

  // Form fields
  const [assetName, setAssetName] = useState('');
  const [assetColor, setAssetColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [custodyResponsible, setCustodyResponsible] = useState('');
  const [custodyNationalId, setCustodyNationalId] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [condition, setCondition] = useState<'سليم' | 'معطوب' | 'تالف' | 'أخرى'>('سليم');
  const [custodyNature, setCustodyNature] = useState<'عهدة لموظف' | 'عهدة للنقطة'>('عهدة لموظف');
  const [notes, setNotes] = useState('');
  const [selectedPointId, setSelectedPointId] = useState(INITIAL_WORK_POINTS[0].id);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshAssets = () => {
    setAssets(storageService.getAllAssets());
    setNextSerial(storageService.getNextAssetSerialNumber());
  };

  const handleOpenAddModal = () => {
    setNextSerial(storageService.getNextAssetSerialNumber());
    setAssetName('');
    setAssetColor('');
    setQuantity(1);
    setCustodyResponsible('');
    setCustodyNationalId('');
    setSpecifications('');
    setCondition('سليم');
    setCustodyNature('عهدة لموظف');
    setNotes('');
    setSelectedPointId(INITIAL_WORK_POINTS[0].id);
    setShowAddModal(true);
  };

  const handleSelectResponsibleStaff = (nid: string) => {
    setCustodyNationalId(nid);
    const emp = storageService.getEmployeeByNid(nid);
    if (emp) {
      setCustodyResponsible(emp.full_name_ar);
      if (emp.current_point_id) {
        setSelectedPointId(emp.current_point_id);
      }
    }
  };

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetName.trim()) {
      alert('الرجاء إدخال اسم الأصل');
      return;
    }

    if (!custodyResponsible.trim()) {
      alert('الرجاء تحديد مسؤول العهدة');
      return;
    }

    const pointObj = INITIAL_WORK_POINTS.find((p) => p.id === selectedPointId) || INITIAL_WORK_POINTS[0];
    const pointDisplayName = selectedPointId === 'pt-admin' ? 'لموظف إداري' : pointObj.name;

    const created = storageService.addAsset({
      asset_name: assetName.trim(),
      asset_color: assetColor.trim() || 'افتراضي',
      quantity: Number(quantity) || 1,
      custody_responsible: custodyResponsible.trim(),
      custody_national_id: custodyNationalId.trim(),
      specifications: specifications.trim(),
      condition: condition,
      custody_nature: custodyNature,
      notes: notes.trim(),
      point_id: selectedPointId,
      point_name: pointDisplayName,
    });

    refreshAssets();
    setShowAddModal(false);
    setSuccessMsg(`تم إضافة الأصل الجديد برقم تسلسلي تلقائي (${created.serial_number}) بنجاح.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleDeleteAsset = (id: string, serial: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الأصل ذو الرقم التسلسلي (${serial})؟`)) {
      storageService.deleteAsset(id);
      refreshAssets();
      setSuccessMsg(`تم حذف الأصل (${serial}) بنجاح.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const filteredAssets = assets.filter((ast) => {
    const matchSearch = 
      ast.serial_number.includes(searchTerm) || 
      ast.asset_name.includes(searchTerm) || 
      ast.custody_responsible.includes(searchTerm) ||
      ast.point_name.includes(searchTerm);

    const matchPoint = filterPoint === 'all' || ast.point_id === filterPoint || (filterPoint === 'pt-admin' && ast.point_name === 'لموظف إداري');
    const matchCondition = filterCondition === 'all' || ast.condition === filterCondition;
    const matchNature = filterNature === 'all' || ast.custody_nature === filterNature;

    return matchSearch && matchPoint && matchCondition && matchNature;
  });

  const totalCount = assets.length;
  const goodCount = assets.filter(a => a.condition === 'سليم').length;
  const issueCount = assets.filter(a => a.condition === 'معطوب' || a.condition === 'تالف').length;
  const personalCount = assets.filter(a => a.custody_nature === 'عهدة لموظف').length;

  const allEmployeesList = storageService.getAllEmployees();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-aei-purple/10 text-aei-purple border border-aei-purple/20 mb-2">
            <Package className="w-3.5 h-3.5" />
            نظام حصر وإدارة العهد والمقتنيات الميدانية
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            إدارة أصول وعهد نقاط التوزيع والعيادات (AST-01001)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            تسجيل وتوثيق المقتنيات بالرقم التسلسلي التلقائي، تتبع الحالة، وربط العهد الشخصية ببوابة الموظف
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-aei-purple to-aei-purple-light hover:to-aei-purple text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة أصل ميداني جديد
          </button>
          <a
            href="/admin/points"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            إدارة النقاط
          </a>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">إجمالي الأصول المسجلة</span>
          <div className="text-2xl font-black text-slate-900">{totalCount} أصل</div>
          <span className="text-[11px] text-slate-500">مرقمة بنظام AST التسلسلي</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">بحالة سليمة</span>
          <div className="text-2xl font-black text-emerald-600">{goodCount} أصل</div>
          <span className="text-[11px] text-slate-500">جاهزة للاستخدام الفوري</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">معطوبة / تالفة</span>
          <div className="text-2xl font-black text-rose-600">{issueCount} أصل</div>
          <span className="text-[11px] text-slate-500">تحتاج صيانة أو استبدال</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400">عهد شخصية لموظفين</span>
          <div className="text-2xl font-black text-aei-purple">{personalCount} أصل</div>
          <span className="text-[11px] text-slate-500">تظهر في بوابة الموظف الذاتية</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالكود AST، اسم الأصل، المسؤول، النقطة..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-xs font-medium"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto flex-wrap text-xs">
          <select
            value={filterPoint}
            onChange={(e) => setFilterPoint(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 focus:border-aei-purple font-medium"
          >
            <option value="all">كافة النقاط</option>
            {INITIAL_WORK_POINTS.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.id === 'pt-admin' ? 'لموظف إداري' : pt.name}
              </option>
            ))}
          </select>

          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 focus:border-aei-purple font-medium"
          >
            <option value="all">كافة الحالات</option>
            <option value="سليم">سليم</option>
            <option value="معطوب">معطوب</option>
            <option value="تالف">تالف</option>
            <option value="أخرى">أخرى</option>
          </select>

          <select
            value={filterNature}
            onChange={(e) => setFilterNature(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 focus:border-aei-purple font-medium"
          >
            <option value="all">طبيعة العهدة (الكل)</option>
            <option value="عهدة لموظف">عهدة لموظف</option>
            <option value="عهدة للنقطة">عهدة للنقطة</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold">
              <tr>
                <th className="p-4">الرقم التسلسلي</th>
                <th className="p-4">اسم الأصل والمواصفات</th>
                <th className="p-4">اللون والكمية</th>
                <th className="p-4">طبيعة العهدة</th>
                <th className="p-4">مسؤول العهدة</th>
                <th className="p-4">النقطة التابع لها</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-black text-aei-purple whitespace-nowrap">
                      {asset.serial_number}
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="font-extrabold text-slate-900 block">{asset.asset_name}</span>
                      {asset.specifications && (
                        <span className="text-[11px] text-slate-500 block line-clamp-1">{asset.specifications}</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span>اللون: {asset.asset_color || 'افتراضي'}</span>
                      <span className="text-slate-400 block text-[11px]">العدد: {asset.quantity}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asset.custody_nature === 'عهدة لموظف'
                          ? 'bg-purple-100 text-aei-purple'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {asset.custody_nature}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block">{asset.custody_responsible}</span>
                      {asset.custody_national_id && (
                        <span className="text-[10px] text-slate-400 font-mono">ID: {asset.custody_national_id}</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{asset.point_name}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        asset.condition === 'سليم'
                          ? 'bg-emerald-100 text-emerald-800'
                          : asset.condition === 'معطوب'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteAsset(asset.id, asset.serial_number)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="حذف الأصل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    لا توجد أصول مطابقة للبحث أو الفلترة الحالية
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Asset Modal (Exact 10 fields specified by user) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-aei-purple block">إضافة مقتنى / أصل جديد</span>
                <h3 className="font-black text-lg text-slate-900">نموذج تسجيل الأصول الميدانية والإدارية</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. الرقم التسلسلي التلقائي */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الرقم التسلسلي (تلقائي)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={nextSerial}
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200 font-mono font-black text-aei-purple text-sm cursor-not-allowed"
                  />
                </div>

                {/* 2. اسم الأصل */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اسم الأصل / المقتنى <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="مثال: جهاز قياس هيموكيو متنقل / ميزان رضّع / تابلت"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 3. لون الأصل */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    لون الأصل
                  </label>
                  <input
                    type="text"
                    value={assetColor}
                    onChange={(e) => setAssetColor(e.target.value)}
                    placeholder="مثال: أبيض / أسود / رمادي"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-xs font-medium"
                  />
                </div>

                {/* 4. عدد الأصل (الكمية) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    عدد الأصل (الكمية) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              {/* 5. مسئول العهدة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مسؤول العهدة (اختيار من الكوادر أو إدخال يدوي) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    onChange={(e) => handleSelectResponsibleStaff(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 focus:border-aei-purple text-xs font-medium"
                  >
                    <option value="">-- اختيار سريع من كشف الكوادر (145) --</option>
                    {allEmployeesList.map((e) => (
                      <option key={e.national_id} value={e.national_id}>
                        {e.full_name_ar} ({e.category} - {e.department})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={custodyResponsible}
                    onChange={(e) => setCustodyResponsible(e.target.value)}
                    placeholder="اسم مسؤول العهدة كاملاً"
                    className="px-3 py-2 rounded-xl border border-slate-300 focus:border-aei-purple text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {/* 6. مواصفات الأصل */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  مواصفات الأصل
                </label>
                <textarea
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="الموديل، الشركة المصنعة، السيريال الداخلي، الملحقات المتضمنة..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 7. حالة الأصل */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    حالة الأصل <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple text-xs font-bold"
                  >
                    <option value="سليم">سليم</option>
                    <option value="معطوب">معطوب</option>
                    <option value="تالف">تالف</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* 8. طبيعة الأصل */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    طبيعة الأصل <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={custodyNature}
                    onChange={(e) => setCustodyNature(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple text-xs font-bold"
                  >
                    <option value="عهدة لموظف">عهدة لموظف (تظهر في بروفايله)</option>
                    <option value="عهدة للنقطة">عهدة للنقطة (مقتنيات عامة داخل النقطة)</option>
                  </select>
                </div>
              </div>

              {/* 9. النقطة التي يتبع لها الأصل (كافة النقاط + الخيار الأخير لموظف إداري) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  النقطة التي يتبع لها الأصل (الخيار الأخير: لموظف إداري) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPointId}
                  onChange={(e) => setSelectedPointId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple text-xs font-bold"
                >
                  <optgroup label="نقاط العمل الميدانية (28 نقطة)">
                    {INITIAL_WORK_POINTS.filter((p) => p.id !== 'pt-admin').map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name} ({pt.geo_zone} - منطقة {pt.point_area})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="الإدارة العامة">
                    <option value="pt-admin">لموظف إداري (مكتب التنسيق والإدارة العامة)</option>
                  </optgroup>
                </select>
              </div>

              {/* 10. ملاحظات */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إضافية
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي معلومات جردية أخرى أو محضر استلام"
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-aei-purple hover:bg-aei-purple-dark text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  حفظ وتثبيت الأصل في المنظومة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
