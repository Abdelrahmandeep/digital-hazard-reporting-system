import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  HardHat, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Mail, 
  Building2,
  RefreshCw,
  X
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

export const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('EMP-');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'worker' | 'engineer' | 'admin'>('worker');
  const [newDept, setNewDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchUsers(roleFilter);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: User) => {
    try {
      await api.toggleUserActive(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newCode || newCode.trim().length < 3) {
      setModalError('يرجى إدخال كود الموظف بشكل صحيح (مثال: EMP-601)');
      return;
    }
    if (!newName || newName.trim().length < 3) {
      setModalError('يرجى إدخال الاسم الكامل للموظف');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createUser({
        employee_code: newCode.trim().toUpperCase(),
        full_name: newName.trim(),
        email: newEmail.trim() || undefined,
        role: newRole,
        department: newDept.trim() || undefined
      });

      setUsers(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      // Reset
      setNewCode('EMP-');
      setNewName('');
      setNewEmail('');
      setNewRole('worker');
      setNewDept('');
    } catch (err: any) {
      setModalError(err.message || 'فشل في إضافة المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const match = 
        u.full_name.toLowerCase().includes(s) ||
        u.employee_code.toLowerCase().includes(s) ||
        (u.department && u.department.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <Briefcase className="w-3 h-3 text-purple-400" />
            <span>مدير المنشأة</span>
          </span>
        );
      case 'engineer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>مهندس سلامة</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <HardHat className="w-3 h-3 text-amber-400" />
            <span>عامل موقع</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>دليل وإدارة المستخدمين والكوادر (User Management)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            إدارة صلاحيات العمال، مهندسي السلامة الميدانيين، وتوزيع الأقسام والمسؤوليات
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Search and Role Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، كود الموظف، القسم، أو البريد الإلكتروني..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Filter by Role */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              roleFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            الكل ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('worker')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              roleFilter === 'worker'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            العمال
          </button>
          <button
            onClick={() => setRoleFilter('engineer')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              roleFilter === 'engineer'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            مهندسو السلامة
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              roleFilter === 'admin'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            الإدارة
          </button>
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">كود الموظف</th>
                <th className="py-3 px-4">الاسم الكامل</th>
                <th className="py-3 px-4">الدور الوظيفي</th>
                <th className="py-3 px-4">القسم / الوحدة</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا يوجد مستخدمين يطابقون خيارات البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {user.employee_code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {user.full_name}
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{user.department || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {user.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{user.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700">
                          <XCircle className="w-3 h-3" />
                          <span>معطل</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                          user.is_active
                            ? 'bg-slate-900 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-800'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {user.is_active ? 'تعطيل الحساب' : 'إعادة التفعيل'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">إضافة مستخدم جديد للنظام</h3>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  كود الموظف <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="مثال: EMP-601 أو ENG-105"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  الاسم الكامل للموظف <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: حسام الدين عبد الرحمن"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  الدور والصلاحية
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="worker">👷 عامل موقع (تقديم بلاغات فقط)</option>
                  <option value="engineer">🔧 مهندس سلامة (مراجعة وفلترة وتحديث البلاغات)</option>
                  <option value="admin">👔 مدير المنشأة (صلاحيات كاملة + إدارة المستخدمين)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  القسم أو الورشة
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="مثال: التخزين، الإنتاج، الصيانة، السلامة"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@factory.local"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
