import { cn } from "./utils"
import { Marquee } from "./Marquee"
import {
    Camera,
    TrendingUp,
    Thermometer,
    CloudRain,
    BarChart3,
    Users,
    DollarSign,
    WifiOff
} from "lucide-react"

// Key features from the PRD
const features = [
    {
        name: "Live Disease Detection",
        username: "MoonDream AI-powered",
        body: "Real-time crop disease detection via live camera feed with 85%+ accuracy",
        icon: Camera,
    },
    {
        name: "Weather Market Insights",
        username: "Predictive Pricing",
        body: "Integration of weather API with market data for optimal selling timing",
        icon: Thermometer,
    },
    {
        name: "Business Crop Advisory",
        username: "ProfitMax Advisor",
        body: "AI-driven recommendations connecting farmers to value chain partners",
        icon: TrendingUp,
    },
    {
        name: "Unified Dashboard",
        username: "One-Stop Solution",
        body: "Integrated view of disease detection, market insights, and business recommendations",
        icon: BarChart3,
    },
    {
        name: "Weather Forecasting",
        username: "Climate Intelligence",
        body: "Accurate 7-day weather forecasts relevant to crop management decisions",
        icon: CloudRain,
    },
    {
        name: "Market Price Tracking",
        username: "Price Transparency",
        body: "Real-time market prices across multiple agricultural markets nationwide",
        icon: DollarSign,
    },
    {
        name: "Offline Processing",
        username: "Accessibility First",
        body: "Works in areas with poor connectivity for 86% farmer coverage",
        icon: WifiOff,
    },
    {
        name: "Value Chain Partners",
        username: "Direct Buyer Links",
        body: "Direct connections to processing companies and exporters for better pricing",
        icon: Users,
    },
]

const firstRow = features.slice(0, 3)
const secondRow = features.slice(3, 6)
const thirdRow = features.slice(6)

const ReviewCard = ({
    name,
    username,
    body,
    icon: Icon,
}: {
    name: string
    username: string
    body: string
    icon: React.ElementType
}) => {
    return (
        <figure
            className={cn(
                "relative h-full w-fit cursor-pointer overflow-hidden rounded-2xl border-2 p-5 sm:w-64 transition-all duration-500 group",
                // premium glassmorphism with vibrant colors
                "border-white/30 bg-gradient-to-br from-white/80 via-green-50/40 to-emerald-50/40",
                "backdrop-blur-xl shadow-2xl",
                "hover:border-green-400/40 hover:shadow-emerald-500/20 hover:shadow-2xl hover:scale-105 hover:bg-gradient-to-br hover:from-white/90 hover:via-green-50/60 hover:to-emerald-50/60",
            )}
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex flex-row items-center gap-3 mb-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 shadow-lg shadow-green-500/30 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <div className="flex flex-col flex-1">
                    <figcaption className="text-sm font-extrabold text-gray-900 group-hover:text-green-700 transition-colors">
                        {name}
                    </figcaption>
                    <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-700">{username}</p>
                </div>
            </div>
            <blockquote className="mt-3 text-xs text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                {body}
            </blockquote>
        </figure>
    )
}

export function Marquee3D() {
    return (
        <div className="relative flex h-[650px] w-full flex-row items-center justify-center gap-6 overflow-visible bg-transparent [perspective:600px]">
            <div
                className="flex flex-row items-center gap-6"
                style={{
                    transformStyle: "preserve-3d",
                    transform:
                        "translateX(0px) translateY(0px) translateZ(-100px) rotateX(15deg) rotateY(-5deg) rotateZ(12deg)",
                }}
            >
                <Marquee
                    pauseOnHover
                    vertical
                    className="[--duration:30s]"
                    repeat={4}
                >
                    {firstRow.map((feature) => (
                        <ReviewCard key={feature.username} {...feature} />
                    ))}
                </Marquee>
                <Marquee
                    reverse
                    pauseOnHover
                    vertical
                    className="[--duration:30s]"
                    repeat={4}
                >
                    {secondRow.map((feature) => (
                        <ReviewCard key={feature.username} {...feature} />
                    ))}
                </Marquee>
                <Marquee
                    pauseOnHover
                    vertical
                    className="[--duration:30s]"
                    repeat={4}
                >
                    {thirdRow.map((feature) => (
                        <ReviewCard key={feature.username} {...feature} />
                    ))}
                </Marquee>
            </div>
        </div>
    )
}
