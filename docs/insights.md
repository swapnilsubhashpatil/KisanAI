# Market Insights Component Documentation

## Overview

The Market Insights component provides real-time agricultural market data with integrated weather impact analysis for farmers and agricultural stakeholders. The component analyzes market trends and provides crop-specific, personalized weather recommendations with an enhanced UI design.

## Component Flow

### 1. Initialization
- Component mounts with Maharashtra state pre-selected (only Maharashtra cities shown)
- Loads any cached data (selected state, city, processed data, crop analyses, etc.)
- Sets up initial state variables for market data, weather data, crop analyses, and UI controls

### 2. City Selection Process
- User selects a city from Maharashtra 
- `fetchCityData` function is triggered with the selected city name
- Initial market data processing with `processMarketData` function
- Real-time weather data is fetched via `auditMarketWithWeather` service
- Top 3 crops analysis is automatically generated with weather impact

### 3. Weather Integration Process
- `auditMarketWithWeather` service fetches current weather for the selected city
- Top 3 crops are identified from market data using `getTopCrops` function
- Crop-specific weather impact analysis is performed for each top crop
- Risk levels (High/Medium/Low) are calculated based on temperature, humidity, and weather conditions
- Personalized, crop-specific one-line recommendations are generated based on risk level
- Weather factors are analyzed (temperature, humidity, precipitation, wind)

### 4. Data Processing Options
- User can select from different insight modes: Accurate, Estimate, Realtime, Predictive
- `handleGetInsights` processes market data with selected mode
- Numeric values are adjusted based on the chosen mode
- Processed data is cached using enhanced `saveResult` utility with crop analyses

### 5. UI Display
- Market statistics cards display key metrics with visual indicators
- Weekly price trend charts show crop price movements over time
- Crop price & yield analysis displays dual-axis visualization
- Local markets section lists prices for all crops in different markets
- Price alerts highlight significant price changes and trends
- Enhanced weather data accordion displays current conditions and crop analysis with amber/yellow theme

## Key Features

### Enhanced Weather Integration
- Real-time weather data fetched for selected city with API fallback
- Top 3 crops analysis with crop-specific risk levels and personalized recommendations
- Detailed weather factor breakdown for each crop (temperature, humidity, precipitation, wind)
- Visual risk indicators with color-coded badges (red/yellow/green)
- Proper spacing and amber/yellow color scheme matching app design

### Market Analysis
- Dynamic pricing based on selected insight mode
- Market-specific price variations with deterministic calculations
- Time-based and seasonal adjustments
- Price alert generation with detailed reasons including weather impacts

### Enhanced Data Persistence
- Local storage caching for selected state, city, processed data, and crop analyses
- Session restoration to maintain user preferences with 24-hour expiry
- Automatic UI state preservation including weather analysis results
- Enhanced error handling and quota management with statistics

### Responsive Design & UI
- Mobile-first responsive layout with amber/yellow theme consistency
- Chart and table view toggle for weekly trends
- Smooth animations and transitions
- Accessibility features with proper color contrast
- Enhanced layout with proper spacing between sections

## Key Functions

### `fetchCityData(cityName)`
- Retrieves market data for the selected city
- Processes market data with `diversifyMarketPrices`
- Fetches and integrates weather data via `auditMarketWithWeather`
- Generates crop-specific analysis and updates all related UI states
- Saves data with crop analyses to persistent storage

### `handleGetInsights()`
- Processes market data according to selected mode
- Applies numeric adjustments based on mode and crop
- Updates processed data display
- Updates persistent storage with all relevant data

### `processNumericValue(value, mode, cropType, marketName)`
- Adjusts numeric values based on mode (Accurate, Estimate, Realtime, Predictive)
- Applies seasonal and market-specific variations
- Maintains realistic price ranges

### `auditMarketWithWeather(marketData, city)`
- Entry point for weather analysis integration
- Returns crop analyses array, weather data, and overall analysis
- Called from `fetchCityData`
- Performs crop-specific risk assessment and recommendation generation

### Storage Functions
- `saveResult(feature, data, expiryHours)`: Saves data to localStorage with expiry 
- `loadResult(feature)`: Loads data from localStorage with automatic expiry check
- `saveMultiple(feature, data)`: Saves multiple related values with individual expiry settings
- `loadMultiple(feature, keys)`: Loads multiple related values by keys

## State Management

### Market Data
- `selectedCity`: Current market data for selected city
- `baseCityData`: Original market data before processing
- `processedData`: Processed data according to insight mode
- `showProcessedData`: Flag to toggle processed vs original data

### Weather & Crop Data
- `weatherData`: Current weather information for selected city
- `weatherAnalysis`: Overall weather impact analysis
- `cropAnalyses`: Array of crop-specific analyses with risk levels and recommendations
- `isWeatherSectionVisible`: Controls weather section visibility
- `isWeatherAccordionOpen`: Controls weather accordion state

### UI Controls
- `insightMode`: Current analysis mode (Accurate/Estimate/Realtime/Predictive)
- `selectedCrop`: Currently selected crop for detailed view
- `isProcessing`: Loading state for AI processing
- `aiPipelineStep`: Current step in AI processing pipeline

## Design Principles

### Consistent Color Scheme
- Amber/yellow gradient theme throughout the application
- Color-coded risk levels (red for high risk, yellow for medium, green for low)
- Visual consistency with other app components
- Proper contrast ratios for accessibility

### Performance
- Client-side data processing to reduce server load
- Caching with expiry for improved user experience
- Optimized data structures for efficient rendering
- Asynchronous operations for non-blocking UI

### User Experience
- Intuitive workflow for market data exploration
- Clear visual hierarchy and information architecture
- Actionable insights with specific recommendations
- Proper spacing and visual separation of content sections
- Responsive design for all device sizes

### Code Quality
- Strongly typed TypeScript implementation
- Modular architecture with clear separation of concerns
- Comprehensive error handling
- Efficient data persistence with expiry management