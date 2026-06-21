import { STATUS_ORDER, STATUS_COLORS } from '../../constants';

export default function AdminDashboard({ data }) {
  const byStatus = Object.keys(STATUS_ORDER).map((s) => ({
    status: s,
    count: data.beans.filter((b) => b.status === s).length,
  }));

  return (
    <div>
      <h2 className="font-serif-jp text-xl mb-6">ダッシュボード</h2>
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        {[
          ['豆', data.beans.length],
          ['農園', data.farms.length],
          ['産地', data.countries.length],
          ['用語', data.terms.length + data.processes.length],
        ].map(([label, count]) => (
          <div key={label} className="border border-stone-200 p-4 text-center">
            <div className="font-serif-jp text-2xl font-light">{count}</div>
            <div className="text-[11px] tracking-widest text-stone-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <h3 className="text-[11px] tracking-widest text-stone-400 mb-3">ステータス別</h3>
      <div className="space-y-2">
        {byStatus.map(({ status, count }) => (
          <div key={status} className={`flex items-center gap-3 border-l-2 ${STATUS_COLORS[status]} pl-4 py-2`}>
            <span className="text-sm flex-1">{status}</span>
            <span className="text-sm text-stone-500">{count}件</span>
          </div>
        ))}
      </div>
    </div>
  );
}
