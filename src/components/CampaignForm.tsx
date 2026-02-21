import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { GeminiService, CampaignData } from '../services/gemini';

interface CampaignFormProps {
  onGenerated: (data: CampaignData) => void;
}

export function CampaignForm({ onGenerated }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [abTest, setAbTest] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const data = await GeminiService.generateCampaign(prompt, abTest);
      onGenerated({ ...data, name });
    } catch (error) {
      console.error('Failed to generate campaign:', error);
      alert('Failed to generate campaign. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-brand-primary/10 rounded-2xl p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-2">
            Campaign Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer Launch 2026"
            className="w-full p-4 bg-brand-bg/30 border border-brand-primary/10 rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all font-sans"
            required
          />
        </div>

        <div>
          <label htmlFor="prompt" className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-2">
            Campaign Objective
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Launch a summer collection for a sustainable fashion brand targeting Gen Z..."
            className="w-full h-32 p-4 bg-brand-bg/30 border border-brand-primary/10 rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all resize-none font-sans"
            required
          />
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="abTest"
            checked={abTest}
            onChange={(e) => setAbTest(e.target.checked)}
            className="w-4 h-4 rounded border-brand-primary/10 text-brand-accent focus:ring-brand-accent"
          />
          <label htmlFor="abTest" className="text-xs font-bold text-brand-primary/60 cursor-pointer select-none">
            Include A/B Test Variants
          </label>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Crafting Campaign...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Campaign
            </>
          )}
        </button>
      </form>
    </div>
  );
}
