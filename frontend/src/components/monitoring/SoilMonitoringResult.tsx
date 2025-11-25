import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Sparkles,
  Gauge,
  Activity,
  Shield,
  Leaf,
} from 'lucide-react';
import { SoilMonitoringResult as SoilResultType } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
  result: SoilResultType;
  image: string | null;
  onRetry: () => void;
}

export const SoilMonitoringResult: React.FC<Props> = ({ result, image, onRetry }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      optimal: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' },
      good: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' },
      fair: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-600' },
      poor: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' },
      critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-600' },
      low: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-600' },
      medium: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' },
      high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-600' },
      none: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' },
    };
    return colors[status as keyof typeof colors] || colors.fair;
  };

  // Prepare chart data - Professional Color Scheme (Blue, Green, Purple)
  const moistureData = [
    { name: 'Moisture', value: result.realTimeMetrics.moisturePercentage, fill: '#3b82f6' }, // Blue-500
    { name: 'Organic', value: result.realTimeMetrics.organicMatterIndicator, fill: '#10b981' }, // Green-500
    { name: 'pH Balance', value: (result.realTimeMetrics.pHEstimate / 14) * 100, fill: '#a855f7' }, // Purple-500
  ];

  // Environmental factors data
  const environmentData = result.environmentalFactors.map(factor => ({
    name: factor.factor,
    status: factor.status,
    value: factor.status === 'optimal' ? 100 : factor.status === 'warning' ? 60 : 30,
    fill: factor.status === 'optimal' ? '#10b981' : factor.status === 'warning' ? '#3b82f6' : '#f59e0b'
  }));

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
        <span className="font-medium text-green-700">Soil analysis completed successfully</span>
      </motion.div>

      {/* Image Preview */}
      {image && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-white/90 rounded-2xl shadow-xl border backdrop-blur-md border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Analyzed Soil Image</h3>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <img src={image} alt="Analyzed soil" className="w-full h-auto object-contain max-h-80" />
          </div>
        </motion.div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Soil Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Layers className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Soil Type</h3>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 mb-2">{result.soilType}</div>
            <div className="text-sm text-gray-600">{result.texture} texture</div>
            <div className="text-xs text-gray-500 mt-1">{result.colorDescription}</div>
          </div>
        </motion.div>

        {/* Moisture Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 bg-gradient-to-br ${getStatusColor(result.moistureLevel).bg} rounded-2xl border ${getStatusColor(result.moistureLevel).border} shadow-xl`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 ${getStatusColor(result.moistureLevel).bg} rounded-xl border ${getStatusColor(result.moistureLevel).border}`}>
              <Droplets className={`w-6 h-6 ${getStatusColor(result.moistureLevel).icon}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Moisture</h3>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStatusColor(result.moistureLevel).text} mb-2 uppercase`}>
              {result.moistureLevel}
            </div>
            <div className="text-sm text-gray-600">{result.realTimeMetrics.moisturePercentage}% Moisture</div>
          </div>
        </motion.div>

        {/* Fertility Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 bg-gradient-to-br ${getStatusColor(result.fertilityEstimate).bg} rounded-2xl border ${getStatusColor(result.fertilityEstimate).border} shadow-xl`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 ${getStatusColor(result.fertilityEstimate).bg} rounded-xl border ${getStatusColor(result.fertilityEstimate).border}`}>
              <Leaf className={`w-6 h-6 ${getStatusColor(result.fertilityEstimate).icon}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Fertility</h3>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor(result.fertilityEstimate).text} mb-2`}>
              {result.fertilityEstimate.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Soil Health</div>
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

      {/* pH and Erosion Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* pH Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gauge className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">pH Level</h3>
          </div>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-2">{result.realTimeMetrics.pHEstimate}</div>
            <div className="text-sm text-gray-600">Soil pH Level</div>
          </div>
          <div className="relative h-4 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full">
            <motion.div
              initial={{ left: '0%' }}
              animate={{ left: `${((result.realTimeMetrics.pHEstimate - 3) / 11) * 100}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-4 border-purple-600 rounded-full shadow-lg"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Acidic (3)</span>
            <span>Neutral (7)</span>
            <span>Alkaline (14)</span>
          </div>
        </motion.div>

        {/* Erosion Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-6 bg-gradient-to-br ${getStatusColor(result.erosionRisk).bg} rounded-2xl border ${getStatusColor(result.erosionRisk).border} shadow-xl`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Erosion Risk</h3>
          </div>
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getStatusColor(result.erosionRisk).text} mb-2 uppercase`}>
              {result.erosionRisk}
            </div>
            <p className="text-sm text-gray-600">{result.analysisSummary}</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Droplets className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Soil Metrics</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moistureData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} barCategoryGap="10%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#999' }}
                />
                <YAxis 
                  fontSize={12}
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#999' }}
                  label={{ value: 'Values', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: '12px' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {moistureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Environmental Factors Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Environmental Factors</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={environmentData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} barCategoryGap="10%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#999' }}
                />
                <YAxis 
                  domain={[0, 100]}
                  fontSize={12}
                  stroke="#666"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#999' }}
                  label={{ value: 'Status', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: '12px' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(217, 119, 6, 0.2)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {environmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Soil Composition Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Composition Analysis</h3>
        </div>
        <div className="text-center">
          <p className="text-base text-gray-700 mb-4">{result.compositionNotes}</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-white/80 rounded-lg border border-blue-200/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600">{result.realTimeMetrics.moisturePercentage}%</div>
              <div className="text-xs text-gray-600 mt-1">Moisture</div>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-lg border border-green-200/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-600">{result.realTimeMetrics.organicMatterIndicator}</div>
              <div className="text-xs text-gray-600 mt-1">Organic Matter</div>
            </div>
            <div className="text-center p-3 bg-white/80 rounded-lg border border-purple-200/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600">{result.realTimeMetrics.pHEstimate}</div>
              <div className="text-xs text-gray-600 mt-1">pH</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Salinity Issue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className={`p-6 bg-gradient-to-br ${getStatusColor(result.salinityIssue).bg} rounded-2xl border ${getStatusColor(result.salinityIssue).border} shadow-xl`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 ${getStatusColor(result.salinityIssue).bg} rounded-xl border ${getStatusColor(result.salinityIssue).border}`}>
            <Droplets className={`w-6 h-6 ${getStatusColor(result.salinityIssue).icon}`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Salinity Status</h3>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${getStatusColor(result.salinityIssue).text} mb-2 uppercase`}>
            {result.salinityIssue === 'none' ? 'No Issues' : result.salinityIssue}
          </div>
          <div className="text-sm text-gray-600">Salt Content Assessment</div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Improvement Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-6 bg-white/90 rounded-2xl border shadow-xl backdrop-blur-md border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Improvement Suggestions</h3>
          </div>
          <ul className="space-y-3">
            {result.improvementSuggestions.map((rec: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Prevention Measures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="p-6 bg-white/90 rounded-2xl border shadow-xl backdrop-blur-md border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Prevention Measures</h3>
          </div>
          <ul className="space-y-3">
            {result.preventionMeasures.map((measure: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0"></div>
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
        transition={{ delay: 1.2 }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-full flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-5 h-5" />
          Analyze Another Sample
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
