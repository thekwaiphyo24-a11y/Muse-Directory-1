export interface CampaignMetric {
  id: string;
  name: string;
  timestamp: number;
  opens: number;
  clicks: number;
  conversions: number;
  sentCount: number;
}

const STORAGE_KEY = 'campaign_analytics_v1';

export class AnalyticsService {
  static getMetrics(): CampaignMetric[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveMetric(metric: CampaignMetric) {
    const metrics = this.getMetrics();
    const index = metrics.findIndex(m => m.id === metric.id);
    if (index >= 0) {
      metrics[index] = metric;
    } else {
      metrics.push(metric);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }

  static trackEvent(campaignId: string, event: 'open' | 'click' | 'conversion') {
    const metrics = this.getMetrics();
    const metric = metrics.find(m => m.id === campaignId);
    if (metric) {
      if (event === 'open') metric.opens++;
      if (event === 'click') metric.clicks++;
      if (event === 'conversion') metric.conversions++;
      this.saveMetric(metric);
    }
  }

  static initCampaign(id: string, name: string, sentCount: number = 1000) {
    const newMetric: CampaignMetric = {
      id,
      name,
      timestamp: Date.now(),
      opens: 0,
      clicks: 0,
      conversions: 0,
      sentCount
    };
    this.saveMetric(newMetric);
    return newMetric;
  }

  static calculateRates(metric: CampaignMetric) {
    const openRate = (metric.opens / metric.sentCount) * 100;
    const ctr = (metric.clicks / (metric.opens || 1)) * 100;
    const conversionRate = (metric.conversions / (metric.clicks || 1)) * 100;
    
    return {
      openRate: openRate.toFixed(1),
      ctr: ctr.toFixed(1),
      conversionRate: conversionRate.toFixed(1)
    };
  }
}
