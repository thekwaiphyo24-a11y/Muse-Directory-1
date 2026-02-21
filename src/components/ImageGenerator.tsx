import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';
import { GeminiService, CampaignData } from '../services/gemini';
import { cn } from '../lib/utils';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface ImageGeneratorProps {
  campaignContext: string;
  onUpdate: (updates: Partial<CampaignData>) => void;
  initialPrompt?: string;
  initialNegativePrompt?: string;
}

export function ImageGenerator({ 
  campaignContext, 
  onUpdate,
  initialPrompt = '',
  initialNegativePrompt = ''
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState(initialNegativePrompt);
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "4:3" | "9:16" | "16:9">("16:9");
  const [style, setStyle] = useState<string>("Photographic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);

  const styles = ["Photographic", "Illustration", "Abstract", "Minimalist", "Cinematic"];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check for API key selection as required for gemini-3-pro-image-preview
    if (typeof window !== 'undefined' && window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKey(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      const fullPrompt = `Marketing visual for: ${campaignContext}. Style: ${style}, Professional, high-end. Specifics: ${prompt}${negativePrompt ? `. Avoid: ${negativePrompt}` : ''}`;
      const imageUrl = await GeminiService.generateImage(fullPrompt, size, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (error: any) {
      console.error('Image generation failed:', error);
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      } else {
        alert('Failed to generate image. Please ensure you have a valid API key selected.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const openKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  return (
    <div className="bg-white border border-brand-primary/10 rounded-2xl p-6 shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="w-5 h-5 text-brand-accent" />
        <h3 className="font-serif italic text-xl">Campaign Visuals</h3>
      </div>

      {needsKey && (
        <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl text-sm">
          <p className="mb-3 font-medium">To generate high-quality visuals, please select a paid Google Cloud API key.</p>
          <button
            onClick={openKeySelector}
            className="px-4 py-2 bg-brand-accent text-white rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Select API Key
          </button>
          <p className="mt-2 text-[10px] opacity-60 italic">
            Note: Requires a project with billing enabled. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">billing docs</a>.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-2">
            Visual Style
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                  style === s 
                    ? "bg-brand-accent text-white border-brand-accent" 
                    : "bg-transparent text-brand-primary/60 border-brand-primary/10 hover:border-brand-primary/30"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-2">
            Visual Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => {
              const val = e.target.value;
              setPrompt(val);
              onUpdate({ visualPrompt: val });
            }}
            placeholder="Describe the image you want (e.g., A minimalist flat-lay of sustainable sneakers with tropical leaves...)"
            className="w-full p-3 bg-brand-bg/20 border border-brand-primary/10 rounded-xl text-sm focus:ring-1 focus:ring-brand-accent outline-none min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-2">
            Undesirable Elements (Negative Prompt)
          </label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => {
              const val = e.target.value;
              setNegativePrompt(val);
              onUpdate({ negativePrompt: val });
            }}
            placeholder="e.g., blurry, low quality, text, logos, people..."
            className="w-full p-3 bg-brand-bg/20 border border-brand-primary/10 rounded-xl text-sm focus:ring-1 focus:ring-brand-accent outline-none"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 mb-2">
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {(["1:1", "3:4", "4:3", "9:16", "16:9"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                    aspectRatio === r 
                      ? "bg-brand-primary text-white border-brand-primary" 
                      : "bg-transparent text-brand-primary/60 border-brand-primary/10 hover:border-brand-primary/30"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {(["1K", "2K", "4K"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                    size === s 
                      ? "bg-brand-primary text-white border-brand-primary" 
                      : "bg-transparent text-brand-primary/60 border-brand-primary/10 hover:border-brand-primary/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-brand-accent text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-accent/90 transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>
        </div>

        {generatedImage && (
          <div className="mt-6 relative group">
            <img 
              src={generatedImage} 
              alt="Generated visual" 
              className="w-full rounded-xl border border-brand-primary/10 shadow-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white">
                <Download className="w-4 h-4 text-brand-primary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
