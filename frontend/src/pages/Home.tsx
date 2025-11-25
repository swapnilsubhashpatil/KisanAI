import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Leaf,
  Play
} from 'lucide-react';
import Market from '../components/Market';
import leafImage from '../assets/leaf.jpg';
import { Marquee3D } from '../effect/Component';

const ScrollIndicator = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 right-0 left-0 z-50 h-1 origin-left bg-primary-500"
    />
  );
};

export const Home: React.FC = () => {
  return (
    <div className="overflow-hidden relative bg-white">
      <ScrollIndicator />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-green-50 via-white to-emerald-50">
        <section className="relative py-12 sm:py-16 lg:py-20 lg:pb-8">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 overflow-hidden">
            <div className="relative grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-8 overflow-visible lg:overflow-hidden">
              <div className="relative z-10">
                <div className="text-center lg:text-left">
                  {/* Market Insights CTA */}
                  <div className="inline-block mb-8">
                    <Link
                      to="/market"
                      className="flex items-center space-x-2.5 border border-green-600/30 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-1 text-sm text-green-700 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300"
                    >
                      <p className="pl-3">Get real-time market prices and insights</p>
                      <div className="flex items-center px-3 py-1 space-x-1 text-white rounded-2xl border shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 border-white/20 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transition-all duration-300">
                        <p>Check</p>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  </div>

                  <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl">
                    Smart Farming Made Simple with{' '}
                    <span
                      className="relative inline-block align-middle"
                      style={{
                        WebkitTextFillColor: 'transparent',
                        WebkitTextStroke: '3px',
                        backgroundImage: `url(${leafImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        fontWeight: 800,
                        letterSpacing: '0.03em'
                      }}
                    >
                      GENERATIVE AI
                    </span>
                  </h1>
                  <p className="mt-3 mb-4 text-lg text-gray-600 sm:mt-6">
                    Use AI to make better farming decisions, detect crop diseases early, and maximize your yield.
                  </p>
                  {/* CTA Buttons */}
                  <div
                    className="flex flex-col gap-4 justify-center items-center mb-12 sm:flex-row lg:justify-start"
                  >
                    <div
                      className="relative group"
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r to-emerald-500 rounded-xl opacity-20 blur-xl transition-all duration-300 from-green-500 group-hover:opacity-40 group-hover:scale-105"
                      />
                      <Link
                        to="/advisory"
                        className="inline-flex relative gap-2 items-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r to-emerald-600 rounded-xl border shadow-lg transition-all duration-300 from-green-600 hover:from-green-700 hover:to-emerald-700 border-white/20 hover:shadow-xl"
                      >
                        <Play className="w-4 h-4" />
                        Check Advisory
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>

                    <div
                      className="relative group"
                    >
                      <div
                        className="absolute inset-0 bg-white rounded-xl opacity-20 blur-xl transition-all duration-300 group-hover:opacity-30 group-hover:scale-105"
                      />
                      <Link
                        to="/monitor"
                        className="inline-flex relative gap-2 items-center px-6 py-3 text-base font-semibold text-gray-900 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 bg-white/90 border-white/30 hover:bg-white hover:shadow-xl"
                      >
                        <Leaf className="w-4 h-4 text-green-500" />
                        Monitor Your Farm
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-10 space-x-6 lg:justify-start sm:space-x-8">
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 sm:text-4xl">95%</p>
                      <p className="ml-3 text-sm text-gray-900">
                        Monitoring
                        <br />
                        Accuracy
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <svg
                        className="text-green-200"
                        width={16}
                        height={39}
                        viewBox="0 0 16 39"
                        fill="none"
                        stroke="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                        <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                        <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                        <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                        <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                      </svg>
                    </div>

                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 sm:text-4xl">50+</p>
                      <p className="ml-3 text-sm text-gray-900">
                        Crops
                        <br />
                        Supported
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marquee3D Component */}
              <div className="hidden lg:flex absolute top-0 bottom-0 right-0 left-1/2 items-center justify-center pr-8 z-0 pointer-events-none">
                <div className="w-full h-full max-w-2xl flex items-center justify-center">
                  <Marquee3D />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Section - Seamless Transition */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <Market />
        </motion.section>
      </div>
    </div>
  );
};

export default Home;