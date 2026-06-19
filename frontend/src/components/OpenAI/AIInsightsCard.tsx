import { useEffect, useMemo, useState } from 'react';
import { AIInsights } from '../../types';
import { getAIInsights } from '../../services/apiServices';
import './AIInsightsCard.css';

function formatDateYYYYMMDD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRecent7DayPeriod() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { startDate: formatDateYYYYMMDD(start), endDate: formatDateYYYYMMDD(end) };
}

export default function AIInsightsCard() {
  const [data, setData] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const period = useMemo(() => getRecent7DayPeriod(), []);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await getAIInsights(period.startDate, period.endDate);
      setData(res);
    } catch (e: any) {
      const message = e?.response?.data?.error || e?.message || 'Failed to load AI insights.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ai-insights-card">
      <div className="ai-insights-header">
        <div>
          <div className="ai-insights-title">AI Insights</div>
          <div className="ai-insights-subtitle">
            {period.startDate} → {period.endDate}
          </div>
        </div>
        <button className="btn btn-secondary btn-small" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="ai-insights-error">
          <div className="ai-insights-error-title">Couldn’t generate insights</div>
          <div className="ai-insights-error-message">{error}</div>
        </div>
      )}

      {!error && !data && !loading && (
        <div className="ai-insights-empty">No insights yet.</div>
      )}

      {data && (
        <>
          <div className="ai-insights-metrics">
            <div className="metric">
              <div className="metric-label">Overall</div>
              <div className="metric-value">{data.metrics.overallCompletionRate}%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Completed</div>
              <div className="metric-value">
                {data.metrics.completedCount}/{data.metrics.logsCount}
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Habits</div>
              <div className="metric-value">{data.metrics.habitsCount}</div>
            </div>
          </div>

          <div className="ai-insights-highlights">
            <div className="highlight">
              <div className="highlight-label">Best habit</div>
              <div className="highlight-value">
                {data.metrics.bestHabit ? `${data.metrics.bestHabit.name} (${data.metrics.bestHabit.completionRate}%)` : '—'}
              </div>
            </div>
            <div className="highlight">
              <div className="highlight-label">Needs attention</div>
              <div className="highlight-value">
                {data.metrics.needsAttentionHabit
                  ? `${data.metrics.needsAttentionHabit.name} (${data.metrics.needsAttentionHabit.completionRate}%)`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="ai-insights-narrative">
            <pre>{data.narrative}</pre>
          </div>
        </>
      )}
    </div>
  );
}

