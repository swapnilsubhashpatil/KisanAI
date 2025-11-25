"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Leaf,
  Fish,
  TrendingUp,
  AlertCircle,
  Database,
  TreePine,
  Settings2,
  CheckCircle2,
  Sparkles,
  Brain,
  DollarSign,
  Target,
  Shield,
  Zap,
  Calendar,
  Activity,
} from "lucide-react"
import {
  getModernFarmingAnalysis,
  type ModernFarmingResponse,
  type ModernFarmingRequest,
} from "../ai/modernFarmingService"
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "../utils/cn"
import { loadResult, saveResult } from "../utils/storage"

// Add custom styles
import "./SmartFarming.css"

const techniques = [
  {
    id: "organic_farming",
    name: "Organic Farming",
    icon: Leaf,
  },
  {
    id: "rainwater_farming",
    name: "Rainwater Farming",
    icon: TreePine,
  },
  {
    id: "integrated_farming",
    name: "Fish Farming",
    icon: Fish,
  },
  {
    id: "other_farming",
    name: "Other",
    icon: Settings2,
  },
] as const

const budgetOptions = [
  { value: "low", label: "Small Scale (< ₹5L)" },
  { value: "medium", label: "Medium Scale (₹5L - ₹20L)" },
  { value: "high", label: "Large Scale (> ₹20L)" },
] as const

const SmartFarming: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<string>("")
  const [selectedBudget, setSelectedBudget] =
    useState<ModernFarmingRequest["budget"]>("medium")
  const [farmSize, setFarmSize] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [analysisData, setAnalysisData] =
    useState<ModernFarmingResponse | null>(null)
  const [customFarmingType, setCustomFarmingType] = useState<string>("")
  const [showResults, setShowResults] = useState<boolean>(false)

  useEffect(() => {
    // Hydrate cached analysis on mount
    const cached = loadResult<{
      inputs: { technique: string; farmSize: string; budget: ModernFarmingRequest["budget"]; custom?: string }
      analysisData: ModernFarmingResponse | null
      showResults: boolean
    }>("smart")
    if (cached) {
      setSelectedTechnique(cached.inputs?.technique || "")
      setFarmSize(cached.inputs?.farmSize || "")
      setSelectedBudget(cached.inputs?.budget || "medium")
      setCustomFarmingType(cached.inputs?.custom || "")
      setAnalysisData(cached.analysisData || null)
      setShowResults(Boolean(cached.showResults && cached.analysisData))
    }
  }, []) // Only run on mount

  // Separate effect for auto-refresh (removed to prevent infinite loops)
  // Auto-refresh functionality can be re-added later if needed with proper dependency management

  // Memoize chart data to prevent infinite re-renders
  const pieChartData = useMemo(() => {
    if (!analysisData) return []
    return [
      { name: "Infrastructure", value: analysisData.techniqueAnalysis.costBreakdown.infrastructure, color: "#3b82f6" },
      { name: "Equipment", value: analysisData.techniqueAnalysis.costBreakdown.equipment, color: "#10b981" },
      { name: "Seeds", value: analysisData.techniqueAnalysis.costBreakdown.seeds, color: "#f59e0b" },
      { name: "Labor", value: analysisData.techniqueAnalysis.costBreakdown.labor, color: "#ef4444" },
      { name: "Maintenance", value: analysisData.techniqueAnalysis.costBreakdown.maintenance, color: "#8b5cf6" },
      { name: "Miscellaneous", value: analysisData.techniqueAnalysis.costBreakdown.miscellaneous, color: "#06b6d4" }
    ]
  }, [analysisData])

  const radarChartData = useMemo(() => {
    if (!analysisData) return []
    return [
      { subject: "Water", A: analysisData.metrics.resourceEfficiency.water, fullMark: 100 },
      { subject: "Labor", A: analysisData.metrics.resourceEfficiency.labor, fullMark: 100 },
      { subject: "Energy", A: analysisData.metrics.resourceEfficiency.energy, fullMark: 100 },
      { subject: "Yield", A: analysisData.metrics.resourceEfficiency.yield, fullMark: 100 },
      { subject: "Sustainability", A: analysisData.metrics.resourceEfficiency.sustainability, fullMark: 100 },
      { subject: "Fertilizer", A: analysisData.metrics.resourceEfficiency.fertilizer, fullMark: 100 },
      { subject: "Pesticide", A: analysisData.metrics.resourceEfficiency.pesticide, fullMark: 100 }
    ]
  }, [analysisData])

  const financialProjectionsData = useMemo(() => {
    if (!analysisData) return []
    return [
      { year: "Year 1", revenue: analysisData.financialProjections.year1.revenue, expenses: analysisData.financialProjections.year1.expenses, profit: analysisData.financialProjections.year1.profit },
      { year: "Year 2", revenue: analysisData.financialProjections.year2.revenue, expenses: analysisData.financialProjections.year2.expenses, profit: analysisData.financialProjections.year2.profit },
      { year: "Year 3", revenue: analysisData.financialProjections.year3.revenue, expenses: analysisData.financialProjections.year3.expenses, profit: analysisData.financialProjections.year3.profit }
    ]
  }, [analysisData])

  // Check if all required inputs are provided and valid
  const isFormValid = () => {
    if (!selectedTechnique || !farmSize || farmSize === '0' || Number(farmSize) <= 0) {
      return false
    }
    if (selectedTechnique === "other_farming" && !customFarmingType.trim()) {
      return false
    }
    return true
  }

  // Validate farming relevance on client side
  const isFarmingRelated = (technique: string): boolean => {
    const farmingKeywords = [
      'organic', 'farming', 'agriculture', 'crop', 'soil', 'irrigation', 'harvest',
      'rainwater', 'fish', 'aquaculture', 'hydroponic', 'vertical', 'greenhouse',
      'sustainable', 'permaculture', 'biodynamic', 'precision', 'smart', 'modern',
      'traditional', 'conventional', 'natural', 'ecological', 'regenerative',
      'livestock', 'dairy', 'poultry', 'aquaponics', 'aeroponics', 'container',
      'rooftop', 'urban', 'rural', 'farm', 'field', 'plantation', 'orchard',
      'vineyard', 'garden', 'cultivation', 'planting', 'seeding', 'fertilizer',
      'compost', 'pesticide', 'herbicide', 'weed', 'pest', 'disease', 'yield',
      'production', 'harvesting', 'storage', 'processing', 'marketing', 'distribution'
    ]

    const techniqueLower = technique.toLowerCase()

    // Check if technique contains farming-related keywords
    const hasFarmingKeyword = farmingKeywords.some(keyword =>
      techniqueLower.includes(keyword)
    )

    // Check for obvious non-farming content
    const nonFarmingKeywords = [
      'porn', 'sex', 'adult', 'gambling', 'casino', 'drug', 'illegal', 'hack',
      'crack', 'virus', 'malware', 'spam', 'scam', 'fraud', 'theft', 'robbery',
      'murder', 'kill', 'violence', 'weapon', 'bomb', 'terrorist', 'extremist',
      'political', 'election', 'vote', 'government', 'policy', 'law', 'legal',
      'medical', 'health', 'disease', 'cancer', 'treatment', 'therapy', 'surgery',
      'finance', 'investment', 'stock', 'trading', 'crypto', 'bitcoin', 'money',
      'entertainment', 'movie', 'music', 'game', 'sport', 'football', 'basketball',
      'technology', 'programming', 'coding', 'software', 'app', 'website', 'internet',
      'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'video'
    ]

    const hasNonFarmingKeyword = nonFarmingKeywords.some(keyword =>
      techniqueLower.includes(keyword)
    )

    // Check for gibberish (too many random characters, no vowels, etc.)
    const hasVowels = /[aeiou]/i.test(techniqueLower)
    const hasConsonants = /[bcdfghjklmnpqrstvwxyz]/i.test(techniqueLower)
    const isGibberish = technique.length > 10 && (!hasVowels || !hasConsonants)

    return hasFarmingKeyword && !hasNonFarmingKeyword && !isGibberish
  }

  const handleAnalysis = async () => {
    if (!isFormValid()) {
      if (!selectedTechnique) {
        toast.error("Please select a farming technique", {
          style: {
            background: "#FF5757",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        })
      } else if (!farmSize || farmSize === '0' || Number(farmSize) <= 0) {
        toast.error("Please enter a valid farm size", {
          style: {
            background: "#FF5757",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        })
      } else if (selectedTechnique === "other_farming" && !customFarmingType.trim()) {
        toast.error("Please specify your farming technique", {
          style: {
            background: "#FF5757",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        })
      }
      return
    }

    // Client-side validation for farming relevance
    const techniqueToValidate = selectedTechnique === "other_farming" ? customFarmingType : selectedTechnique
    if (!isFarmingRelated(techniqueToValidate)) {
      toast.error("Not Applicable: Please enter a valid farming technique related to agriculture.", {
        style: {
          background: "#FF8C00",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        duration: 6000,
      })
      // Clear the form to prevent further invalid queries
      setSelectedTechnique("")
      setFarmSize("")
      setCustomFarmingType("")
      return
    }

    setLoading(true)
    const analysisPromise = getModernFarmingAnalysis({
      technique:
        selectedTechnique === "other_farming"
          ? customFarmingType
          : selectedTechnique,
      farmSize,
      budget: selectedBudget,
    })

    toast.promise(
      analysisPromise,
      {
        loading: "Generating farming analysis...",
        success: "Analysis completed successfully",
        error: "Failed to generate analysis",
      },
      {
        style: {
          minWidth: "250px",
          padding: "16px",
          borderRadius: "8px",
        },
      }
    )

    try {
      const data = await analysisPromise
      setAnalysisData(data)
      setShowResults(true)
      // Persist successful results
      saveResult("smart", {
        inputs: {
          technique: selectedTechnique === "other_farming" ? customFarmingType : selectedTechnique,
          farmSize,
          budget: selectedBudget,
          custom: selectedTechnique === "other_farming" ? customFarmingType : undefined,
        },
        analysisData: data,
        showResults: true,
      })
    } catch (err) {
      console.error("Analysis Error:", err)

      // Check if it's a NOT_APPLICABLE error
      if (err instanceof Error && err.message.includes("NOT_APPLICABLE")) {
        toast.error(
          "Not Applicable: Please enter a valid farming technique related to agriculture.",
          {
            style: {
              background: "#FF8C00",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
            duration: 6000,
          }
        )
        // Clear the form to prevent further invalid queries
        setSelectedTechnique("")
        setFarmSize("")
        setCustomFarmingType("")
      } else {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to generate analysis. Please try again.",
          {
            style: {
              background: "#FF5757",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
            duration: 5000,
          }
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // For scrolling to results
  const analysisResultsRef = React.useRef<HTMLDivElement>(null)

  // Scroll to results function
  const scrollToResults = () => {
    if (analysisResultsRef.current) {
      analysisResultsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    // Scroll to results when analysis is completed or loaded
    if (!loading && analysisData) {
      setTimeout(() => scrollToResults(), 200)
    }
  }, [loading, analysisData])

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const slideIn = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4 },
  }

  return (
    <div className="overflow-auto relative h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-cyan-50/30">
      <Toaster position="top-right" />

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="px-4 py-8 mx-auto max-w-7xl md:py-12 sm:px-6 lg:px-8"
      >
        {/* Input Form Section - Only show when not showing results */}
        {!showResults && (
          <>
            {/* Header Section */}
            <motion.div variants={fadeIn} className="mb-8 text-center md:mb-10">
              <motion.div
                variants={slideIn}
                className="inline-flex gap-2 items-center px-4 py-2 mb-3 bg-blue-50 rounded-full border border-blue-100 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  AI-Powered Analysis
                </span>
              </motion.div>
              <motion.h1
                variants={slideIn}
                className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 md:text-4xl"
              >
                Smart Farming Techniques
              </motion.h1>
              <motion.p
                variants={slideIn}
                className="mx-auto mt-3 max-w-2xl text-gray-600 md:text-lg"
              >
                Optimize your agricultural practices with cutting-edge AI insights
                for modern farming implementation
              </motion.p>
            </motion.div>

            {/* Selection Panel */}
            <motion.div
              variants={fadeIn}
              className="px-4 mx-auto mb-10 max-w-4xl md:mb-12 sm:px-0"
            >
              <motion.div
                variants={slideIn}
                className="p-6 rounded-2xl border border-blue-50 shadow-lg backdrop-blur-sm bg-white/50"
              >
                <h2 className="mb-5 text-xl font-semibold text-gray-800">
                  Configure Your Analysis
                </h2>
                <div className="space-y-6">
                  {/* Technique Selection */}
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Select Farming Technique
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
                      {techniques.map((tech, index) => (
                        <motion.button
                          key={tech.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            setSelectedTechnique(tech.id)
                            if (tech.id !== "other_farming") {
                              setCustomFarmingType("")
                            }
                          }}
                          className={cn(
                            "relative p-4 rounded-lg border-2 transition-all flex flex-col items-center text-center hover:shadow-md group",
                            selectedTechnique === tech.id
                              ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                              : "border-gray-200 hover:bg-blue-50/50 hover:border-blue-200"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                              selectedTechnique === tech.id
                                ? "bg-blue-100"
                                : "bg-gray-100 group-hover:bg-blue-100"
                            )}
                          >
                            <tech.icon
                              className={cn(
                                "w-5 h-5 transition-all duration-300",
                                selectedTechnique === tech.id
                                  ? "text-blue-600"
                                  : "text-gray-600 group-hover:text-blue-600"
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium transition-all duration-300",
                              selectedTechnique === tech.id
                                ? "text-blue-600"
                                : "text-gray-700 group-hover:text-blue-600"
                            )}
                          >
                            {tech.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Farming Type Input */}
                  <AnimatePresence>
                    {selectedTechnique === "other_farming" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-2"
                      >
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Specify Your Farming Technique
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Vertical Farming, Hydroponics, etc."
                          value={customFarmingType}
                          onChange={(e) => setCustomFarmingType(e.target.value)}
                          className={cn(
                            "block px-4 py-3 w-full rounded-lg border transition-all bg-white/80 focus:ring-2",
                            customFarmingType && !isFarmingRelated(customFarmingType)
                              ? "border-orange-300 focus:border-orange-500 focus:ring-orange-200"
                              : "border-purple-200 focus:border-purple-500 focus:ring-purple-200"
                          )}
                        />
                        {customFarmingType && !isFarmingRelated(customFarmingType) && (
                          <p className="mt-1 text-xs text-orange-600">
                            ⚠️ Please enter a farming technique related to agriculture
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Farm Size Input */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Farm Size
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Enter size in acres"
                        value={farmSize}
                        onChange={(e) => {
                          const value = e.target.value
                          // Only allow positive numbers
                          if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                            setFarmSize(value)
                          }
                        }}
                        min="0"
                        step="1"
                        className="block py-3 pr-12 pl-4 w-full rounded-lg border border-gray-200 transition-all bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <div className="flex absolute top-0 right-0 items-center pr-4 h-full">
                        <span className="text-sm text-gray-500">acres</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Selection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Budget Range
                    </label>
                    <select
                      value={selectedBudget}
                      onChange={(e) =>
                        setSelectedBudget(
                          e.target.value as ModernFarmingRequest["budget"]
                        )
                      }
                      className="block px-4 py-3 w-full rounded-lg border border-gray-200 transition-all bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      {budgetOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Analysis Button */}
                  <button
                    onClick={handleAnalysis}
                    disabled={loading || !isFormValid()}
                    className={cn(
                      "flex justify-center items-center px-6 py-3.5 w-full text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative group",
                      isFormValid() && !loading
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="mr-3 w-5 h-5 rounded-full border-white animate-spin border-3 border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : !isFormValid() ? (
                      <>
                        <span className="flex relative z-10 items-center">
                          <Brain className="mr-2 w-5 h-5" />
                          <span>Complete all fields to generate analysis</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex relative z-10 items-center">
                          <Brain className="mr-2 w-5 h-5" />
                          <span className="mr-1">Generate AI Analysis</span>
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Results Section - Only show when results are displayed */}
        {showResults && analysisData && (
          <>
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex gap-2 items-center px-4 py-2 mb-3 bg-green-50 rounded-full border border-green-100 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Analysis Complete
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-500 to-cyan-500 md:text-4xl"
              >
                {analysisData.techniqueAnalysis.overview.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Analysis
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mx-auto mt-3 max-w-2xl text-gray-600 md:text-lg"
              >
                Comprehensive farming analysis with detailed insights and recommendations
              </motion.p>
            </motion.div>

            {/* Analysis Display */}
            <div ref={analysisResultsRef}></div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 text-center rounded-2xl border border-blue-100 shadow-md bg-white/80"
                >
                  <div className="flex flex-col justify-center items-center">
                    <div className="relative mb-6 w-24 h-24">
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-blue-100"></div>
                      <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent animate-spin border-t-blue-500"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Brain className="w-10 h-10 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">
                      AI Analysis in Progress
                    </h3>
                    <p className="mb-6 max-w-lg text-gray-600">
                      Our AI system is working through multiple phases to provide
                      optimal farming insights...
                    </p>
                    <div className="flex flex-col gap-4 w-full max-w-md">
                      {/* Phase 1: Thinking */}
                      <motion.div
                        className="p-3 bg-white rounded-lg border border-blue-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex gap-3 items-center mb-2">
                          <div className="flex justify-center items-center w-6 h-6 bg-blue-100 rounded-full">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                          <span className="font-medium text-gray-700">
                            Phase 1: Thinking
                          </span>
                          <div className="ml-auto">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2.5, duration: 0.3 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </motion.div>
                          </div>
                        </div>
                        <div className="mb-2 ml-9 text-sm text-gray-600">
                          Analyzing your input parameters and context
                        </div>
                        <div className="overflow-hidden flex-1 ml-9 h-2 bg-blue-100 rounded-full">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                          />
                        </div>
                      </motion.div>

                      {/* Phase 2: Gathering */}
                      <motion.div
                        className="p-3 bg-white rounded-lg border border-blue-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.7, duration: 0.5 }}
                      >
                        <div className="flex gap-3 items-center mb-2">
                          <div className="flex justify-center items-center w-6 h-6 bg-blue-100 rounded-full">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                          <span className="font-medium text-gray-700">
                            Phase 2: Gathering Data
                          </span>
                          <div className="ml-auto">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 5.5, duration: 0.3 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </motion.div>
                          </div>
                        </div>
                        <div className="mb-2 ml-9 text-sm text-gray-600">
                          Collecting relevant agriculture metrics and case studies
                        </div>
                        <div className="overflow-hidden flex-1 ml-9 h-2 bg-blue-100 rounded-full">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              delay: 2.7,
                              duration: 2.8,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </motion.div>

                      {/* Phase 3: Planning */}
                      <motion.div
                        className="p-3 bg-white rounded-lg border border-blue-100"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 5.7, duration: 0.5 }}
                      >
                        <div className="flex gap-3 items-center mb-2">
                          <div className="flex justify-center items-center w-6 h-6 bg-blue-100 rounded-full">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                          <span className="font-medium text-gray-700">
                            Phase 3: Planning
                          </span>
                          <div className="ml-auto">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 8.5, duration: 0.3 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </motion.div>
                          </div>
                        </div>
                        <div className="mb-2 ml-9 text-sm text-gray-600">
                          Creating implementation plan and resource allocation
                        </div>
                        <div className="overflow-hidden flex-1 ml-9 h-2 bg-blue-100 rounded-full">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              delay: 5.7,
                              duration: 2.8,
                              ease: "easeInOut",
                            }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : analysisData ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  {/* Success Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center items-center p-4 bg-green-50 rounded-xl border border-green-100 shadow-sm"
                  >
                    <CheckCircle2 className="mr-2 w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      Analysis completed successfully
                    </span>
                  </motion.div>

                  {/* Enhanced Results Display */}
                  <div className="space-y-8">
                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 md:grid-cols-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white rounded-2xl border border-blue-100 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-4">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Total Investment</h3>
                        </div>
                        <div className="mb-2 text-3xl font-bold text-blue-600">
                          ₹{analysisData.techniqueAnalysis.overview.estimatedCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysisData.techniqueAnalysis.overview.timeToRoi} ROI
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white rounded-2xl border border-green-100 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-4">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">ROI</h3>
                        </div>
                        <div className="mb-2 text-3xl font-bold text-green-600">
                          {analysisData.techniqueAnalysis.overview.roi}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysisData.techniqueAnalysis.overview.successRate}% Success Rate
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-white rounded-2xl border border-purple-100 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-4">
                          <div className="p-3 bg-purple-100 rounded-xl">
                            <Target className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Market Demand</h3>
                        </div>
                        <div className="mb-2 text-3xl font-bold text-purple-600">
                          {analysisData.techniqueAnalysis.overview.marketDemand}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysisData.techniqueAnalysis.overview.riskLevel} Risk
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 bg-white rounded-2xl border border-orange-100 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-4">
                          <div className="p-3 bg-orange-100 rounded-xl">
                            <Shield className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Sustainability</h3>
                        </div>
                        <div className="mb-2 text-3xl font-bold text-orange-600">
                          {analysisData.techniqueAnalysis.overview.sustainabilityScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Environmental Impact
                        </div>
                      </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      {/* Cost Breakdown Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-6">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Cost Breakdown</h3>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>

                      {/* Resource Efficiency Radar Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-6">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Activity className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Resource Efficiency</h3>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarChartData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                              <Radar name="Efficiency" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    </div>

                    {/* Financial Projections */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                    >
                      <div className="flex gap-3 items-center mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BarChart className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">3-Year Financial Projections</h3>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialProjectionsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                            <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    {/* Implementation Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                    >
                      <div className="flex gap-3 items-center mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Implementation Timeline</h3>
                      </div>
                      <div className="space-y-4">
                        {analysisData.implementation.phases.map((phase, index) => (
                          <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                                phase.priority === "High" ? "bg-red-500" :
                                  phase.priority === "Medium" ? "bg-yellow-500" :
                                    "bg-green-500"
                              )}>
                                {index + 1}
                              </div>
                              {index < analysisData.implementation.phases.length - 1 && (
                                <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                                <div className="flex gap-2">
                                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                    {phase.duration}
                                  </span>
                                  <span className={cn(
                                    "px-2 py-1 text-xs font-medium rounded-full",
                                    phase.priority === "High" ? "bg-red-100 text-red-800" :
                                      phase.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-green-100 text-green-800"
                                  )}>
                                    {phase.priority}
                                  </span>
                                </div>
                              </div>
                              <p className="mb-3 text-sm text-gray-600">{phase.description}</p>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <h5 className="mb-1 text-xs font-medium text-gray-500">Key Milestones:</h5>
                                  <ul className="space-y-1 text-xs text-gray-600">
                                    {phase.keyMilestones.map((milestone, idx) => (
                                      <li key={idx} className="flex gap-1 items-center">
                                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                        {milestone}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="mb-1 text-xs font-medium text-gray-500">Success Metrics:</h5>
                                  <ul className="space-y-1 text-xs text-gray-600">
                                    {phase.successMetrics.map((metric, idx) => (
                                      <li key={idx} className="flex gap-1 items-center">
                                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                        {metric}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div className="mt-3 text-sm font-semibold text-gray-900">
                                Cost: ₹{phase.estimatedCost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Recommended Crops & Technology */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-6">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Leaf className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Recommended Crops</h3>
                        </div>
                        <div className="space-y-3">
                          {analysisData.techniqueAnalysis.overview.recommendedCrops.map((crop, index) => (
                            <div key={index} className="flex gap-3 items-center p-3 bg-green-50 rounded-lg">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">{crop.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg"
                      >
                        <div className="flex gap-3 items-center mb-6">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Zap className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Essential Technology</h3>
                        </div>
                        <div className="space-y-3">
                          {analysisData.technologyRecommendations.essential.map((tech, index) => (
                            <div key={index} className="flex gap-3 items-center p-3 bg-blue-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium text-gray-900">{tech}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 text-center rounded-2xl border border-blue-100 shadow-lg backdrop-blur-sm bg-white/80"
                >
                  <div className="inline-flex justify-center items-center p-4 mb-6 bg-blue-50 rounded-full">
                    <AlertCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    Ready for Analysis
                  </h3>
                  <p className="mx-auto max-w-lg text-gray-600">
                    Select a farming technique and specify your farm size to receive
                    AI-powered insights for implementation
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-12 text-center">
              <div className="inline-flex gap-2 items-center px-4 py-2 rounded-full border border-blue-100 bg-white/50">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Powered by Advanced AI Analytics
                </span>
              </div>
            </div>
          </>
        )}

        {/* Empty State - Show when no results and not showing input form */}
        {!showResults && !analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center rounded-2xl border border-blue-100 shadow-lg backdrop-blur-sm bg-white/80"
          >
            <div className="inline-flex justify-center items-center p-4 mb-6 bg-blue-50 rounded-full">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Ready for Analysis
            </h3>
            <p className="mx-auto max-w-lg text-gray-600">
              Select a farming technique and specify your farm size to receive
              AI-powered insights for implementation
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default SmartFarming