import React from 'react';
import Markdown from 'react-markdown';
import { Mail, Target, Music, Palette, Type, ArrowRight, Play, MousePointer2, CheckCircle2 } from 'lucide-react';
import { CampaignData } from '../services/gemini';
import { ImageGenerator } from './ImageGenerator';
import { AnalyticsService, CampaignMetric } from '../services/analytics';

interface CampaignPreviewProps {
  data: CampaignData;
  campaignId: string;
  onUpdate: (updates: Partial<CampaignData>) => void;
}

export function CampaignPreview({ data, campaignId, onUpdate }: CampaignPreviewProps) {
  const [metrics, setMetrics] = React.useState<CampaignMetric | null>(null);

  React.useEffect(() => {
    const m = AnalyticsService.getMetrics().find(m => m.id === campaignId);
    if (m) setMetrics(m);
  }, [campaignId]);

  const handleSimulate = (event: 'open' | 'click' | 'conversion') => {
    AnalyticsService.trackEvent(campaignId, event);
    const m = AnalyticsService.getMetrics().find(m => m.id === campaignId);
    if (m) setMetrics(m);
    // Dispatch event for dashboard to update
    window.dispatchEvent(new Event('storage'));
  };

  const rates = metrics ? AnalyticsService.calculateRates(metrics) : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Simulation Controls */}
      <div className="bg-brand-primary text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <h3 className="font-serif italic text-xl">Simulation Lab</h3>
          <p className="text-xs opacity-60">Test your campaign performance in real-time</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleSimulate('open')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Play className="w-3 h-3" /> Simulate Open
          </button>
          <button 
            onClick={() => handleSimulate('click')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <MousePointer2 className="w-3 h-3" /> Simulate Click
          </button>
          <button 
            onClick={() => handleSimulate('conversion')}
            className="px-4 py-2 bg-brand-accent text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" /> Simulate Conversion
          </button>
        </div>
      </div>

      {/* Campaign Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-brand-primary/40">
            <Target className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Audience</span>
          </div>
          <p className="text-sm font-medium">{data.targetAudience}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-brand-primary/40">
            <Palette className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Tone</span>
          </div>
          <p className="text-sm font-medium">{data.tone}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-brand-primary/40">
            <Type className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">CTA</span>
          </div>
          <p className="text-sm font-medium">{data.callToAction}</p>
        </div>
      </div>

      {/* Email Preview */}
      <div className="bg-white rounded-3xl border border-brand-primary/10 shadow-xl overflow-hidden">
        <div className="bg-brand-bg/50 p-6 border-b border-brand-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif italic text-2xl leading-none">{data.name || 'Email Draft'}</h2>
              <p className="text-xs text-brand-primary/40 mt-1">{data.name ? 'Email Draft' : 'Ready for review'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-4 text-sm">
              <span className="w-16 font-bold text-brand-primary/40">Subject A:</span>
              <span className="font-medium">{data.subject}</span>
            </div>
            {data.subjectB && (
              <div className="flex gap-4 text-sm">
                <span className="w-16 font-bold text-brand-accent/60">Subject B:</span>
                <span className="font-medium text-brand-accent">{data.subjectB}</span>
              </div>
            )}
            <div className="flex gap-4 text-sm">
              <span className="w-16 font-bold text-brand-primary/40">Preview:</span>
              <span className="text-brand-primary/60 italic">{data.previewText}</span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="markdown-body max-w-none">
            <Markdown
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    onClick={(e) => {
                      handleSimulate('click');
                      if (props.onClick) props.onClick(e);
                    }}
                  />
                ),
              }}
            >
              {data.body}
            </Markdown>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => handleSimulate('click')}
                className="px-8 py-4 bg-brand-primary text-white rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20"
              >
                <span className="text-[10px] opacity-50 mr-2">CTA A</span>
                {data.callToAction}
                <ArrowRight className="w-5 h-5" />
              </button>
              {data.callToActionB && (
                <button 
                  onClick={() => handleSimulate('click')}
                  className="px-8 py-4 bg-brand-accent text-white rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-brand-accent/20"
                >
                  <span className="text-[10px] opacity-50 mr-2">CTA B</span>
                  {data.callToActionB}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
            {data.callToActionB && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/30">
                A/B Testing Enabled: Compare performance of different calls to action
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Visuals Section */}
      <ImageGenerator 
        campaignContext={data.subject} 
        onUpdate={onUpdate}
        initialPrompt={data.visualPrompt}
        initialNegativePrompt={data.negativePrompt}
      />
    </div>
  );
}
