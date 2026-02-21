import React, { useState } from 'react';
import { CampaignForm } from './components/CampaignForm';
import { CampaignPreview } from './components/CampaignPreview';
import { ChatBot } from './components/ChatBot';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CampaignData } from './services/gemini';
import { AnalyticsService } from './services/analytics';
import { Sparkles, Layers, MousePointer2, BarChart3 } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [view, setView] = useState<'editor' | 'analytics'>('editor');
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleCampaignGenerated = (data: CampaignData) => {
    const id = data.name ? data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(7) : Math.random().toString(36).substring(7);
    AnalyticsService.initCampaign(id, data.name || data.subject);
    setCampaign(data);
    setCampaignId(id);
    setView('editor');
  };

  const updateCampaign = (updates: Partial<CampaignData>) => {
    setCampaign(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleExport = () => {
    if (!campaign) return;

    const content = `
CAMPAIGN CRAFT AI - EXPORT
--------------------------
Campaign Name: ${campaign.name || 'Untitled'}
Subject A: ${campaign.subject}
${campaign.subjectB ? `Subject B: ${campaign.subjectB}` : ''}
Preview Text: ${campaign.previewText}
Target Audience: ${campaign.targetAudience}
Tone: ${campaign.tone}
Call to Action A: ${campaign.callToAction}
${campaign.callToActionB ? `Call to Action B: ${campaign.callToActionB}` : ''}

VISUALS:
--------
Prompt: ${campaign.visualPrompt || 'Not specified'}
Negative Prompt: ${campaign.negativePrompt || 'None'}

BODY:
-----
${campaign.body}

--------------------------
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = campaign.name ? campaign.name.toLowerCase().replace(/\s+/g, '-') : campaign.subject.toLowerCase().replace(/\s+/g, '-');
    a.download = `campaign-${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!campaign) return;
    const text = `Subject: ${campaign.subject}\n\n${campaign.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center rotate-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif italic text-2xl leading-none">CampaignCraft</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary/40 mt-1">AI Marketing Suite</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView('editor')}
              className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors",
                view === 'editor' ? "text-brand-accent" : "hover:text-brand-accent"
              )}
            >
              Editor
            </button>
            <button 
              onClick={() => setView('analytics')}
              className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors",
                view === 'analytics' ? "text-brand-accent" : "hover:text-brand-accent"
              )}
            >
              Analytics
            </button>
            <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Strategy</a>
          </nav>

          <div className="flex items-center gap-3">
            {shareSuccess && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                Copied to clipboard!
              </span>
            )}
            <button 
              onClick={handleShare}
              disabled={!campaign}
              className="px-5 py-2.5 bg-white border border-brand-primary/10 text-brand-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-bg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Share
            </button>
            <button 
              onClick={handleExport}
              disabled={!campaign}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Export Campaign
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-brand-accent" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-primary/60">New Campaign</h2>
              </div>
              <CampaignForm onGenerated={handleCampaignGenerated} />
            </section>

            <section>
              <button 
                onClick={() => setView('analytics')}
                className="w-full p-6 bg-white border border-brand-primary/10 rounded-2xl shadow-sm flex items-center justify-between group hover:border-brand-accent transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">View Analytics</h3>
                    <p className="text-[10px] text-brand-primary/40 uppercase tracking-wider">Historical Data</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-primary/20 group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
              </button>
            </section>

            <section className="bg-brand-primary text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-serif italic text-xl mb-2">Need a Strategy?</h3>
                <p className="text-sm opacity-70 mb-4">Our AI marketing consultant is ready to help you refine your message.</p>
                <div className="flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-widest cursor-pointer" onClick={() => {}}>
                  Open Chat <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </section>
          </div>

          {/* Main Content: Preview */}
          <div className="lg:col-span-8">
            {view === 'analytics' ? (
              <AnalyticsDashboard />
            ) : !campaign ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white/50 border-2 border-dashed border-brand-primary/10 rounded-[40px]">
                <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mb-6">
                  <MousePointer2 className="w-8 h-8 text-brand-primary/20" />
                </div>
                <h2 className="font-serif italic text-3xl mb-4">Start your next campaign</h2>
                <p className="text-brand-primary/40 max-w-md mx-auto leading-relaxed">
                  Enter your campaign goals in the sidebar to generate professional copy, subject lines, and visuals in seconds.
                </p>
              </div>
            ) : (
              <CampaignPreview 
                data={campaign} 
                campaignId={campaignId!} 
                onUpdate={updateCampaign}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-primary/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-widest text-brand-primary/30 font-bold">
            © 2026 CampaignCraft AI • Built with Gemini 3.1
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] uppercase tracking-widest text-brand-primary/30 font-bold hover:text-brand-primary transition-colors">Privacy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-brand-primary/30 font-bold hover:text-brand-primary transition-colors">Terms</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-brand-primary/30 font-bold hover:text-brand-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Chat Bot */}
      <ChatBot />
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
