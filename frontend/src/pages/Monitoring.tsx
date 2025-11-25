import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Leaf, Mountain, Thermometer, Plane, Loader } from 'lucide-react';
import { 
  analyzeCropImage, 
  analyzeSoilImage, 
  analyzeThermalImage, 
  analyzeFieldImage,
  isValidImage
} from '../ai/monitoringService';
import { MonitoringType, CropMonitoringResult, SoilMonitoringResult, ThermalMonitoringResult, FieldMonitoringResult } from '../types';
import { InvalidImageResult } from '../components/monitoring/InvalidImageResult';
import { CropMonitoringResult as CropMonitoringResultComponent } from '../components/monitoring/CropMonitoringResult';
import { SoilMonitoringResult as SoilMonitoringResultComponent } from '../components/monitoring/SoilMonitoringResult';
import { ThermalMonitoringResult as ThermalMonitoringResultComponent } from '../components/monitoring/ThermalMonitoringResult';
import { FieldMonitoringResult as FieldMonitoringResultComponent } from '../components/monitoring/FieldMonitoringResult';
import toast, { Toaster } from 'react-hot-toast';

const DEFAULT_MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const MONITORING_TYPES = [
  {
    type: 'crop' as MonitoringType,
    icon: Leaf,
    title: 'Crop Image',
    description: 'Detect diseases, pests, and nutrient deficiencies',
    color: 'green',
    bgGradient: 'from-green-50 to-emerald-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  {
    type: 'soil' as MonitoringType,
    icon: Mountain,
    title: 'Soil Image',
    description: 'Analyze soil moisture, fertility, and composition',
    color: 'amber',
    bgGradient: 'from-amber-50 to-orange-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    type: 'thermal' as MonitoringType,
    icon: Thermometer,
    title: 'Thermal Image',
    description: 'Identify water stress and irrigation issues',
    color: 'red',
    bgGradient: 'from-red-50 to-pink-50',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  {
    type: 'field' as MonitoringType,
    icon: Plane,
    title: 'Field Image (Drone)',
    description: 'Assess crop growth and field uniformity',
    color: 'blue',
    bgGradient: 'from-blue-50 to-cyan-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
];

const Monitoring: React.FC = () => {
  const [selectedType, setSelectedType] = useState<MonitoringType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CropMonitoringResult | SoilMonitoringResult | ThermalMonitoringResult | FieldMonitoringResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: DEFAULT_MAX_IMAGE_SIZE,
    disabled: isAnalyzing,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setIsDragActive(false);
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        setErrorMessage(
          error.code === 'file-too-large'
            ? 'File is too large. Maximum size is 10MB'
            : 'Invalid file type. Please upload a valid image.'
        );
        toast.error('Invalid file');
        return;
      }
      if (acceptedFiles.length > 0) {
        setErrorMessage(null);
        setSelectedType(null);
        setAnalysisResult(null);
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(acceptedFiles[0]);
      }
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const addProcessingStep = (step: string) => {
    setProcessingSteps((prev) => [...prev, step]);
  };

  const handleAnalysis = async (imageData: string, type: MonitoringType) => {
    if (!type || !imageData) return;

    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAnalysisResult(null);
      setProcessingSteps([]);
      setCurrentStep(0);

      // Processing steps for monitoring analysis
      const steps = [
        { message: 'Preparing image for analysis...', duration: 800 },
        { message: 'Uploading to AI system...', duration: 1000 },
        { message: 'Running image recognition...', duration: 1500 },
        { message: 'Analyzing visual patterns...', duration: 1800 },
        { message: 'Generating insights...', duration: 1200 },
        { message: 'Finalizing report...', duration: 800 },
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setCurrentStep(i);
        addProcessingStep(step.message);
        await new Promise((r) => setTimeout(r, step.duration));
      }

      let result: CropMonitoringResult | SoilMonitoringResult | ThermalMonitoringResult | FieldMonitoringResult;

      switch (type) {
        case 'crop':
          result = await analyzeCropImage(imageData);
          break;
        case 'soil':
          result = await analyzeSoilImage(imageData);
          break;
        case 'thermal':
          result = await analyzeThermalImage(imageData);
          break;
        case 'field':
          result = await analyzeFieldImage(imageData);
          break;
        default:
          throw new Error('Invalid monitoring type');
      }

      addProcessingStep('Analysis complete!');
      setAnalysisResult(result);
      
      if (!isValidImage(result)) {
        toast.error('Invalid image detected');
      } else {
        toast.success('Analysis complete!');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Analysis failed'
      );
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTypeSelection = (type: MonitoringType) => {
    setSelectedType(type);
    if (image) {
      handleAnalysis(image, type);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysisResult(null);
    setSelectedType(null);
    setErrorMessage(null);
    setProcessingSteps([]);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 py-12 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
            Smart Monitoring System
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered agricultural monitoring for better farm management
          </p>
        </motion.div>

        {/* Upload Section - Show First */}
        <AnimatePresence mode="wait">
          {!image && !analysisResult && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div
                  className={`relative p-12 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    isDragActive
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-green-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Upload Image for Monitoring
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag & drop your image here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPEG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Type Selection - Show After Upload */}
          {image && !selectedType && !analysisResult && !isAnalyzing && (
            <motion.div
              key="type-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {/* Show uploaded image preview */}
              <div className="mb-6 text-center">
                <img
                  src={image}
                  alt="Uploaded"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetAnalysis}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Upload Different Image
                </motion.button>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Select Monitoring Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MONITORING_TYPES.map((type) => (
                  <motion.button
                    key={type.type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTypeSelection(type.type)}
                    disabled={isAnalyzing}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isAnalyzing
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : `border-gray-200 bg-white hover:border-${type.color}-300 hover:bg-gradient-to-br hover:${type.bgGradient}`
                    }`}
                  >
                    <type.icon className={`w-8 h-8 mx-auto mb-3 ${type.iconColor}`} />
                    <h3 className="font-semibold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading State with Processing Steps */}
          {isAnalyzing && selectedType && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border">
                <div className="text-center mb-8">
                  <Loader className="w-16 h-16 mx-auto mb-4 text-green-600 animate-spin" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Analyzing {MONITORING_TYPES.find((t) => t.type === selectedType)?.title}
                  </h3>
                  <p className="text-gray-600">AI processing in progress...</p>
                </div>

                {/* Processing Steps */}
                <div className="space-y-3">
                  {processingSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === currentStep
                            ? 'bg-green-500 animate-pulse'
                            : index < currentStep
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          index <= currentStep
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {analysisResult && !isAnalyzing && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {isValidImage(analysisResult) ? (
                <>
                  {selectedType === 'crop' && (
                    <CropMonitoringResultComponent
                      result={analysisResult as CropMonitoringResult}
                      image={image}
                      onRetry={resetAnalysis}
                    />
                  )}
                  {selectedType === 'soil' && (
                    <SoilMonitoringResultComponent
                      result={analysisResult as SoilMonitoringResult}
                      image={image}
                      onRetry={resetAnalysis}
                    />
                  )}
                  {selectedType === 'thermal' && (
                    <ThermalMonitoringResultComponent
                      result={analysisResult as ThermalMonitoringResult}
                      image={image}
                      onRetry={resetAnalysis}
                    />
                  )}
                  {selectedType === 'field' && (
                    <FieldMonitoringResultComponent
                      result={analysisResult as FieldMonitoringResult}
                      image={image}
                      onRetry={resetAnalysis}
                    />
                  )}
                </>
              ) : (
                <InvalidImageResult onRetry={resetAnalysis} message={analysisResult.analysisSummary} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {errorMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
