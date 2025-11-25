import React from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  AlertTriangle,
  Bug,
  Droplets,
  Activity,
  TrendingUp,
  Shield,
  CheckCircle2,
  Target,
  Sparkles,
} from 'lucide-react';
import { CropMonitoringResult as CropResultType } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  result: CropResultType;
  image: string | null;
  onRetry: () => void;
}

export const CropMonitoringResult: React.FC<Props> = ({ result, image, onRetry }) => {
  const getSeverityColor = (severity: string) => {
    const colors = {
      none: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' },
      mild: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-600' },
      moderate: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' },
      severe: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-600' },
      low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' },
      medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' },
      high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-600' },
    };
    return colors[severity as keyof typeof colors] || colors.none;
  };

  // Prepare chart data
  const healthData = [
    { name: 'Health Score', value: result.realTimeMetrics.healthScore, fill: '#3b82f6' },
    { name: 'Stress Level', value: result.realTimeMetrics.stressLevel, fill: '#10b981' },
    { name: 'Yield Impact', value: result.realTimeMetrics.yieldImpact, fill: '#a855f7' },
  ];

  const affectedAreaData = [
    { name: 'Healthy', value: 100 - result.affectedArea, fill: '#10b981' },
    { name: 'Affected', value: result.affectedArea, fill: '#3b82f6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center items-center p-4 bg-green-50 rounded-xl border border-green-100 shadow-sm"
      >
        <CheckCircle2 className="mr-2 w-5 h-5 text-green-600" />
        <span className="font-medium text-green-700">Crop analysis completed successfully</span>
      </motion.div>

      {/* Image Preview */}
      {image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-white/90 rounded-2xl shadow-xl border backdrop-blur-md border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Analyzed Crop Image</h3>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <img src={image} alt="Analyzed crop" className="w-full h-auto object-contain max-h-80" />
          </div>
        </motion.div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Crop Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Crop Type</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{result.cropType}</div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${getSeverityColor(result.cropHealth).bg} ${getSeverityColor(result.cropHealth).border} border`}>
              <span className={`text-sm font-medium ${getSeverityColor(result.cropHealth).text}`}>
                {result.cropHealth.toUpperCase()} Health
              </span>
            </div>
          </div>
        </motion.div>

        {/* Disease Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 bg-gradient-to-br ${getSeverityColor(result.diseaseSeverity).bg} rounded-2xl border shadow-xl backdrop-blur-sm ${getSeverityColor(result.diseaseSeverity).border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 ${getSeverityColor(result.diseaseSeverity).bg} rounded-xl border ${getSeverityColor(result.diseaseSeverity).border}`}>
              <AlertTriangle className={`w-6 h-6 ${getSeverityColor(result.diseaseSeverity).icon}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Disease</h3>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${getSeverityColor(result.diseaseSeverity).text} mb-2`}>
              {result.diseaseDetected}
            </div>
            <div className={`text-sm ${getSeverityColor(result.diseaseSeverity).text} uppercase font-medium`}>
              {result.diseaseSeverity} Severity
            </div>
          </div>
        </motion.div>

        {/* Pest Infestation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 bg-gradient-to-br ${getSeverityColor(result.pestSeverity).bg} rounded-2xl border shadow-xl backdrop-blur-sm ${getSeverityColor(result.pestSeverity).border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 ${getSeverityColor(result.pestSeverity).bg} rounded-xl border ${getSeverityColor(result.pestSeverity).border}`}>
              <Bug className={`w-6 h-6 ${getSeverityColor(result.pestSeverity).icon}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Pests</h3>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${getSeverityColor(result.pestSeverity).text} mb-2`}>
              {result.pestInfestation}
            </div>
            <div className={`text-sm ${getSeverityColor(result.pestSeverity).text} uppercase font-medium`}>
              {result.pestSeverity} Level
            </div>
          </div>
        </motion.div>

        {/* Confidence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confidence</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{result.confidenceLevel}%</div>
            <div className="text-sm text-gray-600">AI Accuracy</div>
          </div>
        </motion.div>
      </div>

      {/* Health Metrics and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Health Metrics</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} barCategoryGap="10%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#999' }}
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#999' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-white/80 rounded-lg border border-green-200/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600">{result.realTimeMetrics.healthScore}</div>
              <div className="text-xs text-gray-600 mt-1">Health Score</div>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-lg border border-red-200/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-red-600">{result.realTimeMetrics.stressLevel}</div>
              <div className="text-xs text-gray-600 mt-1">Stress Level</div>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-lg border border-orange-200/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-orange-600">{result.realTimeMetrics.yieldImpact}%</div>
              <div className="text-xs text-gray-600 mt-1">Yield Impact</div>
            </div>
          </div>
        </motion.div>

        {/* Affected Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Affected Area Analysis</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="healthyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="affectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <Pie
                  data={affectedAreaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  label={(entry: any) => `${entry.value.toFixed(1)}%`}
                  labelLine={false}
                >
                  {affectedAreaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === 'Healthy' ? 'url(#healthyGradient)' : 'url(#affectedGradient)'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(251, 146, 60, 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4 p-3 bg-white/80 rounded-lg border border-orange-200/50 backdrop-blur-sm">
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(result.affectedArea)}% of plant affected
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nutrient Deficiency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Droplets className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Nutrient Analysis</h3>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600 mb-2">{result.diseaseDetected}</div>
          <p className="text-sm text-gray-600">{result.analysisSummary}</p>
        </div>
      </motion.div>

      {/* Environmental Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-6 bg-white/90 rounded-2xl border shadow-xl backdrop-blur-md border-white/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Environmental Factors</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.environmentalFactors.map((factor, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border backdrop-blur-sm ${factor.status === 'optimal'
                ? 'bg-green-50/80 border-green-200/50'
                : factor.status === 'warning'
                  ? 'bg-yellow-50/80 border-yellow-200/50'
                  : 'bg-red-50/80 border-red-200/50'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${factor.status === 'optimal'
                    ? 'bg-green-100 text-green-700'
                    : factor.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                    }`}
                >
                  {factor.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Treatment and Prevention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-6 bg-white/90 rounded-2xl border shadow-xl backdrop-blur-md border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Treatment Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {result.treatmentRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Preventive Measures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-6 bg-white/90 rounded-2xl border shadow-xl backdrop-blur-md border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Preventive Measures</h3>
          </div>
          <ul className="space-y-3">
            {result.preventiveMeasures.map((measure, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{measure}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-full flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
          Analyze Another Crop
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
