import express from "express";
import cors from "cors";
import { Ollama } from "ollama";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const ollama = new Ollama();

const getLocalDiseaseDetectionPrompt = () => {
  return `You are an expert agricultural pathologist. Analyze the provided plant image and return a response strictly in JSON format.

**Analysis Requirements:**
- Identify any plant disease with high accuracy
- Provide correct crop name identification
- Deliver detailed environmental analysis
- Include real-time disease metrics
- Suggest organic and IPM-based treatments
- Outline clear prevention measures

**Response must be pure JSON (no markdown formatting) with this exact structure:**
{
  "diseaseName": "string",
  "cropName": "string",
  "timeToTreat": "string",
  "estimatedRecovery": "string",
  "yieldImpact": "string",
  "severityLevel": "mild|medium|severe",
  "symptomDescription": "string",
  "environmentalFactors": [
    {
      "factor": "string",
      "currentValue": "string",
      "optimalRange": "string",
      "status": "optimal|warning|critical"
    }
  ],
  "realTimeMetrics": {
    "spreadRisk": {
      "level": "string",
      "value": 75,
      "trend": "increasing|stable|decreasing"
    },
    "diseaseProgression": {
      "stage": "string",
      "rate": 5,
      "nextCheckDate": "2024-01-15"
    },
    "environmentalConditions": {
      "temperature": 25,
      "humidity": 65,
      "soilMoisture": 45,
      "lastUpdated": "2024-01-10 14:30"
    }
  },
  "organicTreatments": ["string"],
  "ipmStrategies": ["string"],
  "preventionPlan": ["string"],
  "confidenceLevel": 85,
  "diagnosisSummary": "string"
}`;
};

const mapLocalResponseToExpected = (localResponse) => {
  // If the response is already in the correct format, return as-is
  if (localResponse.diseaseName && localResponse.cropName && localResponse.confidenceLevel) {
    return localResponse;
  }

  // Map alternative response structures to expected format
  return {
    diseaseName: localResponse.diseaseName || localResponse.diseaseIdentification?.diseaseName || "Unknown Disease",
    cropName: localResponse.cropName || "Unknown Crop",
    timeToTreat: localResponse.timeToTreat || localResponse.treatmentTimeline || "24-48 hours",
    estimatedRecovery: localResponse.estimatedRecovery || localResponse.recoveryEstimates || "1-2 weeks",
    yieldImpact: localResponse.yieldImpact || "Moderate impact expected",
    severityLevel: localResponse.severityLevel || localResponse.severity?.toLowerCase() || "medium",
    symptomDescription: localResponse.symptomDescription || localResponse.stageAndProgression || "Disease symptoms observed",
    environmentalFactors: localResponse.environmentalFactors || [
      {
        factor: "Temperature",
        currentValue: "25°C",
        optimalRange: "20-30°C",
        status: "optimal"
      },
      {
        factor: "Humidity",
        currentValue: "65%",
        optimalRange: "40-70%",
        status: "optimal"
      }
    ],
    realTimeMetrics: {
      spreadRisk: {
        level: localResponse.monitoringData?.spreadRiskPercentage || "Medium",
        value: 75,
        trend: localResponse.monitoringData?.trend || "stable"
      },
      diseaseProgression: {
        stage: "Early",
        rate: 5,
        nextCheckDate: localResponse.nextCheckDate || "2024-01-15"
      },
      environmentalConditions: {
        temperature: 25,
        humidity: 65,
        soilMoisture: 45,
        lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ')
      }
    },
    organicTreatments: localResponse.organicTreatments || 
      (localResponse.organicSolutions ? [localResponse.organicSolutions] : [
        "Apply neem oil spray",
        "Use copper-based fungicide",
        "Improve air circulation"
      ]),
    ipmStrategies: localResponse.ipmStrategies || 
      (localResponse.chemicalSolutions ? [localResponse.chemicalSolutions] : [
        "Monitor field regularly",
        "Remove infected plants",
        "Apply targeted treatments"
      ]),
    preventionPlan: localResponse.preventionPlan || 
      (localResponse.preventiveMeasures ? [localResponse.preventiveMeasures] : [
        "Maintain proper spacing",
        "Ensure good drainage",
        "Regular field inspection"
      ]),
    confidenceLevel: parseInt(localResponse.confidenceLevel) || 
      parseInt(localResponse.diseaseIdentification?.confidencePercentage) || 85,
    diagnosisSummary: localResponse.diagnosisSummary || 
      `Disease detected in ${localResponse.cropName || "plant"} with recommended treatment plan.`
  };
};

app.post("/process-image", async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const tempImagePath = path.join(__dirname, `temp_image_${Date.now()}.jpg`);
    fs.writeFileSync(tempImagePath, base64Data, { encoding: "base64" });

    const prompt = getLocalDiseaseDetectionPrompt();

    const response = await ollama.generate({
      model: "llava:7b",
      prompt: prompt,
      images: [fs.readFileSync(tempImagePath).toString("base64")],
      format: "json",
      stream: false,
    });

    fs.unlinkSync(tempImagePath);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(response.response);
    } catch (parseError) {
      console.error("Failed to parse Ollama response:", response.response);
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error("Unable to parse JSON from response after extraction.");
        }
      } else {
        throw new Error("No valid JSON found in the response.");
      }
    }

    // Map the response to the expected format
    const mappedResponse = mapLocalResponseToExpected(jsonResponse);
    res.json(mappedResponse);

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({
      error: "Failed to process image",
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});