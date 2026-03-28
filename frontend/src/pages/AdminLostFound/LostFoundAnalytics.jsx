import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Target, Award } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const LostFoundAnalytics = ({ stats }) => {
  if (!stats) return (
    <div className="analytics-loading">
      <div className="spinner"></div>
      <p>Crunching analytics data...</p>
    </div>
  );

  const { dailyReports, categoryDistribution, totalsByStatus } = stats;

  // Format dailyReports for BarChart
  const barData = dailyReports.map(d => ({
    name: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: d.count
  }));

  // Format categoryDistribution for PieChart
  const pieData = categoryDistribution.map(d => ({
    name: d._id,
    value: d.count
  })).sort((a, b) => b.value - a.value);

  // Success Rate Calculation
  const totalCount = totalsByStatus.reduce((acc, curr) => acc + curr.count, 0);
  const reclaimedCount = totalsByStatus.find(t => t._id === 'Reclaimed')?.count || 0;
  const lostCount = totalsByStatus.find(t => t._id === 'Lost')?.count || 0;
  
  const successRate = totalCount > 0 ? ((reclaimedCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="analytics-dashboard animate-fade-in">
      <div className="analytics-grid">
        
        {/* Bar Chart Section */}
        <div className="analytics-card chart-card">
          <div className="card-header">
            <TrendingUp size={18} className="header-icon" />
            <h3>Items Reported (Last 30 Days)</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 11}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 11}} stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: 'rgba(139, 92, 246, 0.05)'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={24} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="analytics-card chart-card">
          <div className="card-header">
            <PieIcon size={18} className="header-icon" />
            <h3>Top Categories</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  iconType="circle" 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className="analytics-card success-rate-card">
           <div className="success-content">
              <div className="award-badge">
                <Award size={32} />
              </div>
              <div className="rate-text">
                <span className="label">Campus Recovery Success Rate</span>
                <div className="flex-row">
                  <h2 className="rate-value">{successRate}%</h2>
                  <span className="trend-indicator up">↑ 4.2%</span>
                </div>
              </div>
           </div>
           
           <div className="progress-section">
              <div className="progress-meta">
                <span>{reclaimedCount} items returned to owners</span>
                <span>Target: 80%</span>
              </div>
              <div className="full-progress-bar">
                <div className="progress-fill" style={{ width: `${successRate}%` }}></div>
              </div>
           </div>

           <div className="stat-summary-row">
             <div className="mini-stat">
               <span className="m-label">Lost Reports</span>
               <span className="m-value">{lostCount}</span>
             </div>
             <div className="mini-stat">
               <span className="m-label">Claimed Items</span>
               <span className="m-value">{reclaimedCount}</span>
             </div>
             <div className="mini-stat">
               <span className="m-label">Total Volume</span>
               <span className="m-value">{totalCount}</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LostFoundAnalytics;
