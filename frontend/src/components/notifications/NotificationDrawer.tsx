import React from 'react';
import { X, Bell, AlertOctagon, AlertTriangle, Info, Check, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onSelectNotification?: (reportId?: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">مركز التنبيهات والإشعارات</h3>
                  <p className="text-[11px] text-slate-400">التنبيهات الفورية لمخاطر السلامة الحرجة</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-40" />
                <p>لا توجد تنبيهات جديدة حالياً</p>
                <p className="text-[11px] text-slate-500 mt-1">ستصلك إشعارات فورية عند تسجيل مخاطر عالية أو حرجة</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1">
                {notifications.map((item) => {
                  let borderClass = 'border-slate-800 bg-slate-900/60';
                  let icon = <Info className="w-4 h-4 text-blue-400" />;

                  if (item.level === 'critical') {
                    borderClass = 'border-red-500/40 bg-red-500/10 text-red-200';
                    icon = <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />;
                  } else if (item.level === 'high') {
                    borderClass = 'border-orange-500/40 bg-orange-500/10 text-orange-200';
                    icon = <AlertTriangle className="w-4 h-4 text-orange-400" />;
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.report_id && onSelectNotification) {
                          onSelectNotification(item.report_id);
                          onClose();
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.01] ${borderClass}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex-shrink-0">{icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-0.5 text-xs">{item.title}</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{item.message}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{new Date(item.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                            {item.report_id && (
                              <span className="flex items-center gap-1 text-amber-400 font-semibold hover:underline">
                                <span>عرض البلاغ</span>
                                <ExternalLink className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
