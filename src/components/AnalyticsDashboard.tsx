import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MousePointer2, Target, RefreshCcw } from 'lucide-react';
import { AnalyticsService, CampaignMetric } from '../services/analytics';
import { cn } from '../lib/utils';

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<CampaignMetric[]>([]);

  const loadMetrics = () => {
    setMetrics(AnalyticsService.getMetrics().sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadMetrics();
    // Listen for storage changes or custom events if needed
    window.addEventListener('storage', loadMetrics);
    return () => window.removeEventListener('storage', loadMetrics);
  }, []);

  if (metrics.length === 0) return null;

  const totals = metrics.reduce((acc, m) => ({
    opens: acc.opens + m.opens,
    clicks: acc.clicks + m.clicks,
    conversions: acc.conversions + m.conversions,
    sent: acc.sent + m.sentCount
  }), { opens: 0, clicks: 0, conversions: 0, sent: 0 });

  const globalRates = {
    openRate: ((totals.opens / (totals.sent || 1)) * 100).toFixed(1),
    ctr: ((totals.clicks / (totals.opens || 1)) * 100).toFixed(1),
    conversionRate: ((totals.conversions / (totals.clicks || 1)) * 100).toFixed(1)
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-accent" />
          <h2 className="font-serif italic text-2xl">Performance Insights</h2>
        </div>
        <button 
          onClick={loadMetrics}
          className="p-2 hover:bg-brand-primary/5 rounded-lg transition-colors"
        >
          <RefreshCcw className="w-4 h-4 text-brand-primary/40" />
        </button>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Avg. Open Rate" 
          value={`${globalRates.openRate}%`} 
          icon={<TrendingUp className="w-4 h-4" />} 
          color="text-blue-600"
        />
        <StatCard 
          label="Avg. Click Rate" 
          value={`${globalRates.ctr}%`} 
          icon={<MousePointer2 className="w-4 h-4" />} 
          color="text-emerald-600"
        />
        <StatCard 
          label="Avg. Conversion" 
          value={`${globalRates.conversionRate}%`} 
          icon={<Target className="w-4 h-4" />} 
          color="text-brand-accent"
        />
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white border border-brand-primary/10 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-bg/30 border-b border-brand-primary/5">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-brand-primary/40">Campaign</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-brand-primary/40">Opens</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-brand-primary/40">Clicks</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-brand-primary/40">Conv.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-primary/5">
            {metrics.slice(0, 5).map((m) => {
              const rates = AnalyticsService.calculateRates(m);
              return (
                <tr key={m.id} className="hover:bg-brand-bg/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium truncate max-w-[200px]">{m.name}</div>
                    <div className="text-[10px] text-brand-primary/40">{new Date(m.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono">{m.opens}</div>
                    <div className="text-[10px] text-blue-600 font-bold">{rates.openRate}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono">{m.clicks}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">{rates.ctr}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono">{m.conversions}</div>
                    <div className="text-[10px] text-brand-accent font-bold">{rates.conversionRate}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-primary/10 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-brand-primary/40">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={cn("text-3xl font-serif italic", color)}>{value}</div>
    </div>
  );
}
