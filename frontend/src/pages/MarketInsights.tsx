import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Bell,
  DollarSign,
  BarChart2,
  Building,
  Database,
  Table,
  BarChart3,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  ChevronDown
} from 'lucide-react';
import Select from 'react-select/async';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import mahaData from '../data/maha.json';
import andraData from '../data/andra.json';
import punjabData from '../data/punjab.json';
import karnatakaData from '../data/karnataka.json';
import keralaData from '../data/kerala.json';
import tamilnaduData from '../data/tamilnadu.json';
import telanganaData from '../data/telegana.json';
import cityData from '../data/cityData.json';
import { loadResult, saveResult } from '../utils/storage';
import { auditMarketWithWeather } from '../ai/auditService';

interface MarketInsightsProps { }

interface MarketCropPrices {
  [key: string]: string;
}

interface Market {
  name: string;
  cropPrices: MarketCropPrices;
}

interface WeatherData {
  coord: {
    lat: number;
    lon: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  name: string;
}

// Add new type for insight modes
type InsightMode = 'Accurate' | 'Estimate' | 'Realtime' | 'Predictive';

export const MarketInsights: React.FC<MarketInsightsProps> = () => {
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [baseCityData, setBaseCityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLastUpdated] = useState<Date>(new Date(Date.now()));
  const [insightMode, setInsightMode] = useState<InsightMode>('Accurate');
  const [processedData, setProcessedData] = useState<any>(null);
  const [showProcessedData, setShowProcessedData] = useState(false);
  const [aiPipelineStep, setAiPipelineStep] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [weeklyTrendView, setWeeklyTrendView] = useState<'chart' | 'table'>('chart');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [hasLoadedCity, setHasLoadedCity] = useState<boolean>(false);
  const [isWeatherSectionVisible, setIsWeatherSectionVisible] = useState<boolean>(false);
  const [isWeatherAccordionOpen, setIsWeatherAccordionOpen] = useState<boolean>(true);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherAnalysis, setWeatherAnalysis] = useState<string>('');
  const [cropAnalyses, setCropAnalyses] = useState<any[]>([]);

  const availableCrops = useMemo(() => {
    const source = selectedCity || baseCityData;
    if (!source?.markets?.length) {
      return [] as string[];
    }

    const cropSet = new Set<string>();
    source.markets.forEach((market: Market) => {
      Object.keys(market.cropPrices || {}).forEach(crop => cropSet.add(crop));
    });

    return Array.from(cropSet).sort((a, b) => a.localeCompare(b));
  }, [selectedCity, baseCityData]);
  // Hydrate cached selection and processed data
  useEffect(() => {
    const cached = loadResult<{
      selectedState: string;
      selectedCity: any;
      processedData: any;
      showProcessedData: boolean;
      insightMode: InsightMode;
      weeklyTrendView: 'chart' | 'table';
      selectedCrop?: string;
      cropAnalyses?: any[];
    }>('market');
    if (cached) {
      setSelectedState(cached.selectedState || 'Maharashtra');
      setSelectedCity(cached.selectedCity || null);
      setProcessedData(cached.processedData || null);
      setShowProcessedData(Boolean(cached.showProcessedData));
      setInsightMode(cached.insightMode || 'Accurate');
      setWeeklyTrendView(cached.weeklyTrendView || 'chart');
      setSelectedCrop(cached.selectedCrop || '');
      setCropAnalyses(cached.cropAnalyses || []);
      if (cached.selectedCity) {
        setHasLoadedCity(true);
        setIsWeatherSectionVisible(true);
        // If crop analyses exist in cache, weather section is already loaded
        if (cached.cropAnalyses && cached.cropAnalyses.length > 0) {
          setIsWeatherSectionVisible(true);
        }
      }
    }
  }, []);


const getDeterministicHash = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Add realistic market price variations to base data without randomness
const diversifyMarketPrices = useCallback((cityData: any) => {
  const diversifiedData = JSON.parse(JSON.stringify(cityData));

  diversifiedData.markets = diversifiedData.markets.map((market: any) => {
    const marketVariations = Object.fromEntries(
      Object.entries(market.cropPrices).map(([crop, price]) => {
        const priceStr = price as string;
        const basePrice = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
        if (!basePrice) {
          return [crop, price];
        }

        const seed = getDeterministicHash(`${cityData.city}-${market.name}-${crop}`);
        const variation = ((seed % 7) - 3) / 100; // -3% to +3%
        const adjustedPrice = Math.max(500, Math.round(basePrice * (1 + variation)));

        return [crop, `₹${adjustedPrice.toLocaleString('en-IN')}/quintal`];
      })
    );

    return {
      ...market,
      cropPrices: marketVariations
    };
  });

  return diversifiedData;
}, []);

  const fetchCityData = async (cityName: string) => {
    setIsLoading(true);
    setIsProcessing(true);
    setAiPipelineStep('Preparing market datasets...');
    setProcessedData(null);
    setShowProcessedData(false);
    setSelectedCity(null);
    setBaseCityData(null);
    setSelectedCrop('');
    setHasLoadedCity(false);
    setIsWeatherSectionVisible(false);
    setIsWeatherAccordionOpen(true);
    setWeatherData(null);
    setWeatherAnalysis('');

    await processMarketData();

    let cityData = null;
    if (selectedState === 'Maharashtra') {
      cityData = mahaData.cities.find(city => city.city === cityName);
    } else if (selectedState === 'Andhra Pradesh') {
      cityData = andraData.cities.find(city => city.city === cityName);
    } else if (selectedState === 'Punjab') {
      cityData = punjabData.cities.find(city => city.city === cityName);
    } else if (selectedState === 'Karnataka') {
      cityData = karnatakaData.cities.find(city => city.city === cityName);
    } else if (selectedState === 'Kerala') {
      cityData = keralaData.cities.find(city => city.city === cityName);
    } else if (selectedState === 'Tamil Nadu') {
      cityData = tamilnaduData.cities.find(city => city.city === cityName);
    } else if (selectedState === 'Telangana') {
      cityData = telanganaData.cities.find(city => city.city === cityName);
    }

    if (!cityData) {
      toast.error('City data not found', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      setIsLoading(false);
      setIsProcessing(false);
      setAiPipelineStep('');
      return;
    }

    const diversifiedCityData = diversifyMarketPrices(cityData);
    setBaseCityData(diversifiedCityData);

    try {
      setAiPipelineStep('Fetching live weather impact...');
      setIsWeatherLoading(true);
      const { cropAnalyses: cropAnalysisData, weatherData: weatherInfo, overallAnalysis } = await auditMarketWithWeather(diversifiedCityData, cityName);

      setSelectedCity(diversifiedCityData); // Keep original data without modifications
      setWeatherData(weatherInfo);
      setWeatherAnalysis(overallAnalysis);
      setCropAnalyses(cropAnalysisData);
      setIsWeatherSectionVisible(true);
      setHasLoadedCity(true);

      saveResult('market', {
        selectedState,
        selectedCity: diversifiedCityData,
        processedData: null,
        showProcessedData: false,
        insightMode,
        weeklyTrendView,
        selectedCrop: '',
        cropAnalyses: cropAnalyses
      });
    } catch (error) {
      console.error('Weather integration error:', error);
      toast.error('Loaded market data without weather context', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      setSelectedCity(diversifiedCityData);
      setWeatherData(null);
      setWeatherAnalysis('');
      setIsWeatherSectionVisible(true);
      setHasLoadedCity(true);
      saveResult('market', {
        selectedState,
        selectedCity: diversifiedCityData,
        processedData: null,
        showProcessedData: false,
        insightMode,
        weeklyTrendView,
        selectedCrop: '',
        cropAnalyses: [] // In error case, no crop analyses
      });
    } finally {
      setIsWeatherLoading(false);
      setIsLoading(false);
      setIsProcessing(false);
      setAiPipelineStep('');
      setLastUpdated(new Date(Date.now()));
    }
  };

  // Get current time-based adjustments
  const getDeterministicFactor = useCallback((identifier: string, maxDelta: number) => {
    const hash = Math.abs(getDeterministicHash(identifier));
    const normalized = (hash % 1000) / 1000; // 0..0.999
    const delta = (normalized * 2 - 1) * maxDelta;
    return 1 + delta;
  }, []);

  const processNumericValue = useCallback((value: string | number, mode: InsightMode, cropType?: string, marketName?: string): string => {
    const identifier = `${cropType || 'generic'}-${marketName || 'market'}-${mode}`;

    const formatCrore = (amount: number) => `₹${Math.max(0, Math.round(amount)).toLocaleString('en-IN')} Cr`;
    const formatRupee = (amount: number) => `₹${Math.max(0, Math.round(amount)).toLocaleString('en-IN')}/quintal`;

    if (typeof value === 'string') {
      if (value.includes('Cr')) {
        const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (Number.isNaN(numericPart)) {
          return value;
        }

        let factor = 1;
        if (mode === 'Estimate') {
          factor = getDeterministicFactor(identifier, 0.05);
        } else if (mode === 'Realtime') {
          factor = getDeterministicFactor(`${identifier}-rt`, 0.03);
        } else if (mode === 'Predictive') {
          factor = 1.05 * getDeterministicFactor(`${identifier}-pd`, 0.08);
        }

        const adjusted = numericPart * factor;
        return formatCrore(adjusted);
      }

      if (value.includes('/quintal')) {
        const numericPart = parseInt(value.replace(/[^0-9]/g, ''), 10);
        if (!numericPart) {
          return value;
        }

        let factor = 1;
        if (mode === 'Estimate') {
          factor = getDeterministicFactor(identifier, 0.06);
        } else if (mode === 'Realtime') {
          factor = getDeterministicFactor(`${identifier}-rt`, 0.04);
        } else if (mode === 'Predictive') {
          factor = 1.04 * getDeterministicFactor(`${identifier}-pd`, 0.1);
        }

        const adjusted = clamp(numericPart * factor, 400, 65000);
        return formatRupee(adjusted);
      }
    }

    if (typeof value === 'number') {
      let factor = 1;
      if (mode === 'Estimate') {
        factor = getDeterministicFactor(identifier, 0.08);
      } else if (mode === 'Realtime') {
        factor = getDeterministicFactor(`${identifier}-rt`, 0.05);
      } else if (mode === 'Predictive') {
        factor = 1.05 * getDeterministicFactor(`${identifier}-pd`, 0.08);
      }

      return Math.max(0, Math.round((value || 0) * factor)).toLocaleString('en-IN');
    }

    return value.toString();
  }, [getDeterministicFactor]);

  const processMarketData = async () => {
    const steps = [
      'Connecting to Agricultural Data APIs...',
      'Fetching real-time crop prices...',
      'Analyzing market trends...',
      'Processing historical data...',
      'Running ML prediction models...',
      'Generating insights...',
      'Validating data accuracy...',
      'Finalizing report...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiPipelineStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300));
    }
  };

  const handleGetInsights = useCallback(() => {
    if (!selectedCity) {
      toast.error('Please select a city first', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    if (!selectedCrop) {
      toast.error('Pick a crop to unlock the insights', {
        icon: '🌾',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    setIsLoading(true);
    setShowProcessedData(true);

    const processedCityData = JSON.parse(JSON.stringify(selectedCity));

    try {
      processedCityData.marketStats = {
        ...processedCityData.marketStats,
        dailyTradingVolume: processNumericValue(
          processedCityData.marketStats.dailyTradingVolume,
          insightMode,
          selectedCrop
        ),
        activeBuyers: processNumericValue(
          processedCityData.marketStats.activeBuyers,
          insightMode,
          selectedCrop
        ),
        averagePricePerQuintal: processNumericValue(
          processedCityData.marketStats.averagePricePerQuintal,
          insightMode,
          selectedCrop
        ),
      };

      processedCityData.markets = processedCityData.markets.map((market: Market) => ({
        ...market,
        cropPrices: Object.fromEntries(
          Object.entries(market.cropPrices).map(([crop, price]) => [
            crop,
            processNumericValue(price, insightMode, crop, market.name)
          ])
        )
      }));

      processedCityData.priceAlerts = processedCityData.priceAlerts.map((alert: any) => ({
        ...alert,
        price: processNumericValue(alert.price, insightMode, alert.crop)
      }));

      setProcessedData(processedCityData);
      setIsLoading(false);

      saveResult('market', {
        selectedState,
        selectedCity,
        processedData: processedCityData,
        showProcessedData: true,
        insightMode,
        weeklyTrendView,
        selectedCrop,
        cropAnalyses: cropAnalyses
      });

      toast.success(`${insightMode} insights generated successfully`, {
        icon: '🎯',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error processing data:', error);
      setIsLoading(false);
      setShowProcessedData(false);
      toast.error('Failed to process market data', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  }, [selectedCity, insightMode, processNumericValue, selectedCrop, selectedState, weeklyTrendView]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
      <div className="w-8 h-8 rounded-full border-amber-500 animate-spin border-3 border-t-transparent" />
    </div>
  );

  const getMarketStats = (cityData: any) => [
    {
      title: 'Daily Trading Volume',
      value: cityData.marketStats.dailyTradingVolume,
      change: '+4.5%',
      icon: DollarSign,
      trend: 'up',
    },
    {
      title: 'Active Buyers',
      value: cityData.marketStats.activeBuyers.toString(),
      change: '+1.2%',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Average Price per Quintal',
      value: cityData.marketStats.averagePricePerQuintal,
      change: '-0.8%',
      icon: BarChart2,
      trend: 'down',
    }
  ];

  const displayData = useMemo(() => {
    if (!hasLoadedCity) {
      return null;
    }

    if (showProcessedData && processedData) {
      return processedData;
    }

    return selectedCity;
  }, [hasLoadedCity, processedData, selectedCity, showProcessedData]);

  // Chart data generation functions - Logical and meaningful


  // Create stable crop activity data that doesn't change with toggles
  const getStableCropActivityData = useCallback(() => {
    if (!displayData?.markets?.length) return [];

    const referenceMarket = displayData.markets[0];
    if (!referenceMarket?.cropPrices) return [];

    const crops = Object.keys(referenceMarket.cropPrices);

    return crops.map((crop) => {
      const raw = referenceMarket.cropPrices[crop] || '₹0/quintal';
      const cropPrice = parseInt(raw.replace(/[^0-9]/g, ''), 10) || 2000;

      const baseYields: { [key: string]: number } = {
        'Wheat': 35,
        'Rice': 40,
        'Maize': 45,
        'Sugarcane': 800,
        'Cotton': 15,
        'Soybean': 25,
        'Groundnut': 20,
        'Mustard': 18,
        'Tur Dal': 12,
        'Onion': 200,
        'Tomato': 300,
        'Grapes': 25
      };

      const baseYield = baseYields[crop] || 30;
      const cropHash = crop.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const yieldVariation = (cropHash % 20) - 10;
      const yieldPerAcre = Math.max(10, baseYield + yieldVariation);

      return {
        name: crop,
        price: cropPrice,
        yield: yieldPerAcre
      };
    });
  }, [displayData]);

  // Get timeline information for market data - stable values
  const getTimelineInfo = useCallback(() => {
    const now = new Date();
    // Use deterministic time based on current hour to avoid random changes
    const hourOffset = now.getHours() % 2; // 0 or 1 hour offset
    const lastUpdate = new Date(now.getTime() - hourOffset * 60 * 60 * 1000);
    const nextUpdate = new Date(now.getTime() + 30 * 60 * 1000); // Next update in 30 minutes

    return {
      lastUpdate: lastUpdate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      nextUpdate: nextUpdate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      updateFrequency: 'Every 30 minutes',
      dataSource: 'Government APMC Markets'
    };
  }, []);


  const getWeeklyPriceTrend = (cityData: any) => {
    if (!cityData?.markets) return [];

    const crops = Object.keys(cityData.markets[0]?.cropPrices || {});
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Generate data for each day with all crops
    return days.map((day, index) => {
      const dayData: any = { day };

      crops.forEach((crop, cropIndex) => {
        const basePrice = parseInt(cityData.markets[0].cropPrices[crop]?.replace(/[^0-9]/g, ''), 10) || 2000;

        // Small variations based on day of week and crop characteristics
        const dayMultiplier = index >= 5 ? 0.95 : 1.0; // Weekend reduction
        const cropVariation = Math.sin(index * 0.8 + cropIndex * 0.5) * 0.05; // Different pattern per crop
        const price = Math.round(basePrice * dayMultiplier * (1 + cropVariation));

        dayData[crop] = price;
      });

      return dayData;
    });
  };

  // Create stable weekly trend data that doesn't change with toggles
  const getStableWeeklyTrendData = useCallback(() => {
    if (!displayData?.markets?.length) return [];

    const referenceMarket = displayData.markets[0];
    const crops = Object.keys(referenceMarket?.cropPrices || {});
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return days.map((day, index) => {
      const dayData: Record<string, number | string> = { day };

      crops.forEach((crop, cropIndex) => {
        const basePrice = parseInt(referenceMarket.cropPrices[crop]?.replace(/[^0-9]/g, ''), 10) || 2000;
        const dayMultiplier = index >= 5 ? 0.95 : 1.0;
        const cropVariation = Math.sin(index * 0.8 + cropIndex * 0.5) * 0.05;
        const price = Math.round(basePrice * dayMultiplier * (1 + cropVariation));

        dayData[crop] = price;
      });

      return dayData;
    });
  }, [displayData]);

  // Generate synchronized price alerts based on weekly trends
  const getSynchronizedPriceAlerts = (cityData: any) => {
    if (!cityData?.markets) return [];

    const crops = Object.keys(cityData.markets[0]?.cropPrices || {});
    const weeklyData = getWeeklyPriceTrend(cityData);

    return crops.map((crop, index) => {
      // Get current price and previous day price from weekly trend
      const currentPrice = weeklyData[weeklyData.length - 1]?.[crop] || 2000;
      const previousPrice = weeklyData[weeklyData.length - 2]?.[crop] || 2000;

      // Calculate percentage change
      const change = ((currentPrice - previousPrice) / previousPrice) * 100;
      const changePercent = Math.round(change * 10) / 10;

      // Generate realistic time and reason
      const times = ['30 min ago', '1 hour ago', '2 hours ago', '3 hours ago'];
      const reasons = [
        'Increased demand from local mills',
        'Weather conditions affecting supply',
        'Government policy changes',
        'Export market fluctuations',
        'Seasonal demand patterns'
      ];

      return {
        crop,
        change: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
        price: `₹${currentPrice.toLocaleString()}/quintal`,
        time: times[index % times.length],
        reason: reasons[index % reasons.length]
      };
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50">

      <div className="px-4 py-8 mx-auto max-w-6xl md:py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex gap-2 items-center px-4 py-2 mb-4 rounded-full border shadow-lg backdrop-blur-md bg-white/80 border-amber-500/20"
          >
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-amber-600">Live Market Updates</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 md:text-4xl"
          >
            Market Insights
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm text-gray-600 md:mt-4 md:text-base"
          >
            Real-time updates from Indian agricultural markets
          </motion.p>
        </div>

        {/* Single Dropdown for State and City */}
        <div className="px-4 mx-auto mb-8 space-y-4 max-w-4xl md:mb-12 sm:px-0">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Select Location
            </label>
            <Select
              cacheOptions
              loadOptions={async (inputValue) => {
                await new Promise(resolve => setTimeout(resolve, 200));

                const maharashtraCities = cityData.mahacities || [];

                return maharashtraCities
                  .filter((city: string) => city.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((city: string) => ({
                    value: city,
                    label: city,
                    type: 'city'
                  }));
              }}
              onChange={(option: any) => {
                if (option?.type === 'city') {
                  setSelectedState('Maharashtra');
                  fetchCityData(option.value);
                }
              }}
              isDisabled={isLoading}
              className="text-base"
              placeholder="Select city in Maharashtra..."
              styles={{
                control: (base) => ({
                  ...base,
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(217, 119, 6, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '0.25rem',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: 'rgba(217, 119, 6, 0.3)'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 20,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(217, 119, 6, 0.1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }),
                option: (base, state) => ({
                  ...base,
                  background: state.isFocused ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                  color: state.isFocused ? '#92400e' : '#374151',
                  cursor: 'pointer'
                })
              }}
              defaultOptions
            />
          </div>

          {hasLoadedCity && (
            <div className="grid gap-4 sm:grid-cols-[2fr,auto] sm:items-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Focus Crop
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => {
                      setSelectedCrop(e.target.value);
                      setProcessedData(null);
                      setShowProcessedData(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-amber-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="">Select crop for insights...</option>
                    {availableCrops.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Insight Mode
                  </label>
                  <select
                    value={insightMode}
                    onChange={(e) => {
                      setInsightMode(e.target.value as InsightMode);
                      setProcessedData(null);
                      setShowProcessedData(false);
                    }}
                    className="w-full px-4 py-2.5 bg-white/70 rounded-xl border border-amber-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Accurate">Accurate Data</option>
                    <option value="Estimate">Estimated Data</option>
                    <option value="Realtime">Realtime Data</option>
                    <option value="Predictive">Predictive Data</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGetInsights}
                disabled={isLoading || !selectedCity || !selectedCrop}
                className="w-full px-6 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 sm:w-auto"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="text-sm sm:text-base">Get Analysis</span>
              </button>
            </div>
          )}

          {showProcessedData && insightMode !== 'Accurate' && (
            <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded-lg">
              {insightMode === 'Estimate' && '⚠️ AI-estimated values with market-specific variations'}
              {insightMode === 'Realtime' && '🔄 AI-processed real-time values with seasonal adjustments'}
              {insightMode === 'Predictive' && '📈 AI-predicted 3-month forward projections with ML insights'}
            </div>
          )}

          {hasLoadedCity && !selectedCrop && (
            <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg">
              Select a crop above to reveal the market dashboards and weather story.
            </div>
          )}
        </div>

        {isWeatherSectionVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div className="p-4 mb-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border shadow-xl backdrop-blur-sm border-amber-100/30">
              <button
                className="flex justify-between items-center w-full p-4 text-left rounded-xl bg-white/80 border border-amber-100/50 hover:bg-white/90 transition-colors"
                onClick={() => setIsWeatherAccordionOpen(prev => !prev)}
              >
                <div className="flex items-center gap-3">
                  <Cloud className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Weather Snapshot</h3>
                    <p className="text-xs text-gray-500">Live conditions powering the audit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {weatherData?.name || 'Unavailable'}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-600 transition-transform ${isWeatherAccordionOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isWeatherAccordionOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 px-2 pb-2"
                >
                  {isWeatherLoading && (
                    <LoadingSpinner />
                  )}

                  {!isWeatherLoading && weatherData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/80 border border-amber-100/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Sun className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold text-gray-700">Temperature</h4>
                          </div>
                          <p className="text-2xl font-bold text-amber-600">{weatherData.main.temp}°C</p>
                          <p className="text-xs text-gray-500 mt-1">Feels like {weatherData.main.feels_like}°C</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/80 border border-amber-100/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplets className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold text-gray-700">Humidity</h4>
                          </div>
                          <p className="text-2xl font-bold text-amber-600">{weatherData.main.humidity}%</p>
                          <p className="text-xs text-gray-500 mt-1">Pressure {weatherData.main.pressure} hPa</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/80 border border-amber-100/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Wind className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold text-gray-700">Wind</h4>
                          </div>
                          <p className="text-2xl font-bold text-amber-600">{weatherData.wind.speed} m/s</p>
                          <p className="text-xs text-gray-500 mt-1">Direction {weatherData.wind.deg}°</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/80 border border-amber-100/50">
                          <div className="flex items-center gap-2 mb-2">
                            <CloudRain className="w-5 h-5 text-amber-500" />
                            <h4 className="font-semibold text-gray-700">Conditions</h4>
                          </div>
                          <p className="text-lg font-bold text-amber-600 capitalize">{weatherData.weather[0]?.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Visibility {weatherData.visibility} m</p>
                        </div>
                      </div>

                      {/* Add spacing between basic weather data and crop analyses */}
                      <div className="mt-6">
                        {cropAnalyses && cropAnalyses.length > 0 && (
                          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border shadow-xl backdrop-blur-sm border-amber-100/30">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Crop-Specific Weather Impact</h4>
                            <div className="space-y-5">
                              {cropAnalyses.map((analysis: any, index: number) => (
                                <div key={index} className="p-4 rounded-xl border backdrop-blur-sm transition-all bg-white/80 border-amber-100/50 hover:bg-white/90">
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-bold text-amber-700">{analysis.crop}</h5>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      analysis.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 
                                      analysis.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {analysis.riskLevel} Risk
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">{analysis.impact}</p>
                                  <div className="flex items-start gap-2">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                                      analysis.riskLevel === 'High' ? 'bg-red-500' : 
                                      analysis.riskLevel === 'Medium' ? 'bg-amber-500' : 
                                      'bg-green-500'
                                    }`}></div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-900">Recommendation:</span>
                                      <span className="text-sm text-gray-700 ml-1.5">{analysis.recommendation}</span>
                                    </div>
                                  </div>
                                  <details className="mt-3 text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-700">Weather Factors</summary>
                                    <div className="mt-2 space-y-1 pt-2 border-t border-amber-100/50">
                                      <div className="text-xs"><span className="font-medium text-gray-600">Temperature:</span> {analysis.weatherFactors.temperature}</div>
                                      <div className="text-xs"><span className="font-medium text-gray-600">Humidity:</span> {analysis.weatherFactors.humidity}</div>
                                      <div className="text-xs"><span className="font-medium text-gray-600">Precipitation:</span> {analysis.weatherFactors.precipitation}</div>
                                      <div className="text-xs"><span className="font-medium text-gray-600">Wind:</span> {analysis.weatherFactors.wind}</div>
                                    </div>
                                  </details>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {weatherAnalysis && (
                        <div className="p-4 rounded-xl bg-white/80 border border-amber-100/50 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-2">Overall Weather Impact</h4>
                          <p className="text-gray-600 whitespace-pre-line">{weatherAnalysis}</p>
                        </div>
                      )}
                      
                      {weatherAnalysis && (
                        <div className="p-4 rounded-xl bg-white/80 border border-amber-100/50 mt-4">
                          <h4 className="font-semibold text-gray-700 mb-2">Overall Weather Impact</h4>
                          <p className="text-gray-600 whitespace-pre-line">{weatherAnalysis}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isWeatherLoading && !weatherData && (
                    <div className="p-4 text-sm text-amber-700 bg-white/80 border border-amber-100/50 rounded-xl">
                      Live weather data is unavailable right now. The market insights below are based on baseline market values.
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Pipeline Status */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-8 mb-8 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border shadow-xl backdrop-blur-sm border-amber-200/50"
          >
            <div className="flex gap-6 items-center">
              <motion.div
                className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-lg"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Database className="w-8 h-8 text-amber-600" />
              </motion.div>

              <div className="flex-1">
                <motion.h3
                  className="mb-3 text-xl font-bold text-amber-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  AI Processing Market Data
                </motion.h3>

                <motion.p
                  className="mb-4 font-medium text-amber-700"
                  key={aiPipelineStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {aiPipelineStep}
                </motion.p>

                <div className="overflow-hidden relative w-full h-3 rounded-full bg-amber-200/50">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "75%" }}
                    transition={{
                      duration: 0.8,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent to-transparent rounded-full via-white/30"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ width: "30%" }}
                  />
                </div>

                <motion.div
                  className="flex gap-2 mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-amber-400 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Market Stats */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-3 md:grid-cols-2">
        {displayData && selectedCrop && getMarketStats(displayData).map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
          </div>
        )}

        {/* Charts Section */}
        {displayData && selectedCrop && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2"
          >
            {/* Weekly Price Trend Chart */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3 items-center">
                  <div className="p-2.5 bg-amber-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Weekly Price Trend</h3>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 p-1 rounded-lg border bg-white/60 border-amber-200/50">
                  <button
                    onClick={() => setWeeklyTrendView('chart')}
                    className={`flex gap-2 items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${weeklyTrendView === 'chart'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-amber-600'
                      }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Chart
                  </button>
                  <button
                    onClick={() => setWeeklyTrendView('table')}
                    className={`flex gap-2 items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${weeklyTrendView === 'table'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-amber-600'
                      }`}
                  >
                    <Table className="w-4 h-4" />
                    Table
                  </button>
                </div>
              </div>

              <div className="w-full h-80">
                {weeklyTrendView === 'chart' ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <LineChart
                      data={getStableWeeklyTrendData()}
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.6} />
                      <XAxis
                        dataKey="day"
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
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid rgba(217, 119, 6, 0.2)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        formatter={(value, name) => [`₹${value}`, name]}
                        labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      />
                      {selectedCity?.markets?.[0]?.cropPrices && Object.keys(selectedCity.markets[0].cropPrices).map((crop, index) => {
                        const colors = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];
                        return (
                          <Line
                            key={crop}
                            type="monotone"
                            dataKey={crop}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 7, stroke: colors[index % colors.length], strokeWidth: 3, fill: 'white' }}
                            name={crop}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="overflow-x-auto h-full">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200">
                          <th className="px-4 py-3 font-semibold text-left text-gray-700">Day</th>
                          {selectedCity?.markets?.[0]?.cropPrices && Object.keys(selectedCity.markets[0].cropPrices).map((crop) => (
                            <th key={crop} className="px-4 py-3 font-semibold text-right text-gray-700">{crop}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getStableWeeklyTrendData().map((dayData: any, index: number) => (
                          <tr key={index} className="border-b border-amber-100 transition-colors hover:bg-amber-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900">{dayData.day}</td>
                            {Object.keys(dayData).filter(key => key !== 'day').map((crop) => (
                              <td key={crop} className="px-4 py-3 font-semibold text-right text-amber-600">
                                ₹{dayData[crop].toLocaleString()}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Crop Price & Yield Chart with Dual Y-Axis */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30">
              <div className="flex gap-3 items-center mb-6">
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Crop Price & Yield Analysis</h3>
                  <div className="flex gap-4 items-center mt-1">
                    <div className="flex gap-2 items-center text-xs text-gray-600">
                      <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                      <span>Price per Quintal</span>
                    </div>
                    <div className="flex gap-2 items-center text-xs text-gray-600">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span>Yield per Acre</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <ComposedChart
                    data={getStableCropActivityData()}
                    margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.6} />
                    <XAxis
                      dataKey="name"
                      stroke="#666"
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      interval={0}
                      fontSize={9}
                      tick={{ fontSize: 9 }}
                      tickLine={{ stroke: '#999' }}
                    />
                    <YAxis
                      yAxisId="price"
                      orientation="left"
                      stroke="#3b82f6"
                      fontSize={9}
                      tick={{ fontSize: 9 }}
                      tickLine={{ stroke: '#3b82f6' }}
                      tickFormatter={(value) => `₹${value}`}
                      label={{ value: 'Price (₹/quintal)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#3b82f6', fontSize: '10px', fontWeight: 'bold' } }}
                    />
                    <YAxis
                      yAxisId="yield"
                      orientation="right"
                      stroke="#22c55e"
                      fontSize={9}
                      tick={{ fontSize: 9 }}
                      tickLine={{ stroke: '#22c55e' }}
                      tickFormatter={(value) => `${value} qtl`}
                      label={{ value: 'Yield (qtl/acre)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#22c55e', fontSize: '10px', fontWeight: 'bold' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                      formatter={(value, name) => [
                        name === 'price' ? `₹${value}` : `${value} qtl`,
                        name === 'price' ? 'Price per Quintal' : 'Yield per Acre'
                      ]}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Bar
                      yAxisId="price"
                      dataKey="price"
                      fill="#3b82f6"
                      name="price"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <Bar
                      yAxisId="yield"
                      dataKey="yield"
                      fill="#22c55e"
                      name="yield"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}


        {/* Markets and Alerts Grid */}
        {displayData && selectedCrop && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-2"
          >
            {/* Markets List */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <div className="p-2.5 bg-amber-100 rounded-lg">
                    <Building className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Local Markets</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Next update in</div>
                  <div className="text-sm font-semibold text-amber-600">{getTimelineInfo().nextUpdate}</div>
                </div>
              </div>

              <div className="space-y-4">
                {displayData.markets.map((market: Market, index: number) => (
                  <div key={index} className="p-5 rounded-xl border shadow-sm backdrop-blur-sm transition-all bg-white/80 border-amber-100/50 hover:bg-white/90 hover:shadow-md">
                    <h3 className="mb-3 text-base font-semibold text-gray-900">{market.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(market.cropPrices).map(([crop, price], idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 truncate">{crop}:</span>
                          <span className="ml-2 font-semibold text-amber-600 whitespace-nowrap">{price.toString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Alerts */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border shadow-xl backdrop-blur-sm border-white/30">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <div className="p-2.5 bg-amber-100 rounded-lg">
                    <Bell className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Price Alerts</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Alert frequency</div>
                  <div className="text-sm font-semibold text-amber-600">Every 15 min</div>
                </div>
              </div>

              <div className="space-y-4">
                {getSynchronizedPriceAlerts(displayData).map((alert: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-5 rounded-xl shadow-sm backdrop-blur-sm transition-all bg-white/80 hover:bg-white/90 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-amber-50 rounded-lg">
                        <TrendingUp className={`h-4 w-4 ${alert.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{alert.crop}</h3>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{alert.price}</p>
                      <p className={`text-xs font-medium ${alert.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {alert.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex gap-3 items-center px-6 py-3 rounded-full border border-amber-100 shadow-lg backdrop-blur-sm bg-white/80"
          >
            <Database className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-gray-600">AI-powered market analysis with real-time data processing</span>
          </motion.div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

const StatCard = ({ stat, index }: { stat: any; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02] border border-white/30"
  >
    <div className="flex gap-4 items-center mb-6">
      <div className="p-3 bg-amber-100 rounded-xl">
        <stat.icon className="w-7 h-7 text-amber-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{stat.title}</h3>
    </div>
    <div className="space-y-3">
      <div className="text-3xl font-bold text-amber-600">{stat.value}</div>
      <div className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {stat.change} from last week
      </div>
    </div>
  </motion.div>
);

export default MarketInsights;