# Weather Integration in Market Insights

## Overview

This document explains how the Weather API is integrated into the Kisan-AI Market Insights module to provide crop-specific weather impact analysis for farmers and agricultural stakeholders.

## Integration Purpose

- Fetch real-time weather data for selected cities in the Market Insights module
- Analyze weather impact on the top 3 crops in each selected market
- Provide crop-specific, personalized recommendations based on current weather conditions
- Assess risk levels (High/Medium/Low) for each crop based on weather factors
- Enhance market insights with environmental context for better decision-making

## How It Works

### 1. Request Flow
- When a user selects a city in the Market Insights page, the system automatically fetches weather data for that city
- The `auditMarketWithWeather` function in `auditService.ts` is called with market data and city name
- Weather data is fetched via `fetchWeatherData` from `marketService.ts`

### 2. Data Processing
- Top 3 crops are identified from market data using the `getTopCrops` function
- Weather impact analysis is performed for each crop using the `analyzeCropImpact` function
- Risk level is determined based on temperature, humidity, precipitation, and wind conditions
- Crop-specific, personalized one-line recommendations are generated based on risk level and crop type

### 3. Weather Factors Analyzed
- **Temperature**: Impact on crop stress and growth based on optimal ranges for each crop
- **Humidity**: Risk of fungal diseases and moisture-related issues
- **Precipitation**: Effects of rain/storms on crop quality and harvesting
- **Wind**: Effects on crop stability and evaporation rates

## Implementation Details

### Configuration
The API is configured using the following environment variable:
```env
VITE_WEATHER_KEY=your_openweathermap_api_key
```

### Crop-Specific Analysis
Different crops have specific weather sensitivity profiles:
- **Wheat**: Prefers cool weather, susceptible to high humidity
- **Rice**: Needs warmth and adequate water supply
- **Cotton**: Thrives in warm, low-humidity conditions
- **Sugarcane**: Requires heat and adequate water
- **Onion**: Moderate temperature preferred, susceptible to rot
- **Tomato**: Warm weather ideal, high humidity causes disease

### Risk Assessment & Recommendations
- **High Risk**: Temperature >35°C or <10°C with high humidity >80%
  - Recommendations: Immediate protective measures (e.g., "Apply fungicide immediately")
- **Medium Risk**: Temperature >30°C or <15°C, or humidity >70%
  - Recommendations: Preventive monitoring (e.g., "Monitor for early signs of heat stress")
- **Low Risk**: Optimal temperature and humidity ranges
  - Recommendations: Continue normal farming practices (e.g., "Optimal weather for growth")

### User Interface
- Weather data is displayed in a beautifully designed amber/yellow themed accordion in the Market Insights page
- Crop-specific analysis shows risk level, impact, and personalized recommendations
- Weather factors section provides detailed information for each parameter with expandable details
- Visual indicators (color-coded risk levels) provide quick assessment
- Proper spacing between weather data and crop analysis sections

## Data Persistence

- Crop analyses are stored in localStorage with 24-hour expiry
- Full state restoration including weather analysis results on page refresh
- Enhanced error handling and quota management

## Error Handling

- If weather API is unavailable, the system falls back to showing market data only
- A user-friendly message is displayed when weather data cannot be retrieved
- Market insights continue to function normally with baseline data
