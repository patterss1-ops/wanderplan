'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin,
  Users,
  Calendar,
  Bookmark,
  ArrowRight,
  Plane,
  Hotel,
  Utensils,
  Camera
} from 'lucide-react';

const features = [
  {
    icon: Bookmark,
    title: "Save Everything",
    description: "No more 50 open tabs. Save hotels, activities, and restaurants all in one place."
  },
  {
    icon: MapPin,
    title: "Map-Centric Planning",
    description: "See all your saved places on an interactive map. Visualize your journey."
  },
  {
    icon: Users,
    title: "Plan Together",
    description: "Real-time collaboration with your travel partner. Both can edit simultaneously."
  },
  {
    icon: Calendar,
    title: "Anchor-Based Booking",
    description: "Book the hardest thing first, then work outward. Our unique workflow prevents booking conflicts."
  }
];

const workflow = [
  {
    step: "01",
    title: "Explore",
    description: "Browse destinations, save interesting finds, research without losing anything.",
    icon: Camera,
    color: "from-blue-500 to-cyan-500"
  },
  {
    step: "02",
    title: "Plan",
    description: "Build your day-by-day itinerary. Drag and drop, discuss with your partner.",
    icon: Calendar,
    color: "from-purple-500 to-pink-500"
  },
  {
    step: "03",
    title: "Book",
    description: "Identify your anchor event, lock those dates, then book outward from there.",
    icon: Plane,
    color: "from-orange-500 to-red-500"
  }
];

const categories = [
  { icon: Hotel, label: "Stays" },
  { icon: Plane, label: "Flights" },
  { icon: Utensils, label: "Food" },
  { icon: Camera, label: "Activities" }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">WanderPlan</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="text-muted hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth?mode=signup"
                className="px-4 py-2 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Now in beta - Free to use
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Plan trips together.
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Book smarter.
              </span>
            </h1>

            <p className="text-xl text-muted max-w-2xl mx-auto mb-10">
              The travel planning app for couples who hate losing research in browser tabs.
              Save, plan, and book your dream trips with our unique anchor-based workflow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth?mode=signup"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Start Planning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 border border-border rounded-full font-semibold text-lg hover:bg-card transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              {/* Browser mockup */}
              <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full max-w-md mx-auto h-7 rounded-md bg-muted/20 flex items-center justify-center text-xs text-muted">
                      wanderplan.app/trip/australia-2027
                    </div>
                  </div>
                </div>

                {/* App preview content */}
                <div className="aspect-[16/9] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-8">
                  <div className="h-full rounded-xl border border-border bg-card/80 backdrop-blur flex">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-border p-4 space-y-4">
                      <div className="h-8 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                      <div className="space-y-2">
                        {categories.map((cat, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10">
                            <cat.icon className="w-4 h-4 text-muted" />
                            <span className="text-sm">{cat.label}</span>
                            <span className="ml-auto text-xs bg-muted/20 px-2 py-0.5 rounded-full">{3 + i}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main content - Map placeholder */}
                    <div className="flex-1 p-4 relative">
                      <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                          <p className="text-muted">Interactive map view</p>
                        </div>
                      </div>
                      {/* Floating cards */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute top-8 right-8 w-48 p-3 bg-card rounded-xl shadow-lg border border-border"
                      >
                        <div className="w-full h-20 bg-gradient-to-br from-orange-200 to-pink-200 dark:from-orange-800/30 dark:to-pink-800/30 rounded-lg mb-2"></div>
                        <p className="font-medium text-sm">Sydney Opera House</p>
                        <p className="text-xs text-muted">Activity</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-8 left-8 w-48 p-3 bg-card rounded-xl shadow-lg border border-border"
                      >
                        <div className="w-full h-20 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/30 dark:to-purple-800/30 rounded-lg mb-2"></div>
                        <p className="font-medium text-sm">Pier One Sydney</p>
                        <p className="text-xs text-muted">Accommodation</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative blurs */}
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to plan the perfect trip
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Built by travelers who were tired of scattered browser tabs and forgotten research.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-border hover:border-blue-500/50 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The smarter way to plan trips
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Our three-phase workflow takes you from dreaming to booking without the chaos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {workflow.map((phase, index) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {index < workflow.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent -translate-x-4"></div>
                )}
                <div className="p-8 rounded-2xl border border-border bg-card">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.color} mb-6`}>
                    <phase.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-muted mb-2">STEP {phase.step}</div>
                  <h3 className="text-2xl font-bold mb-3">{phase.title}</h3>
                  <p className="text-muted">{phase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-12 text-center text-white"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to plan your next adventure?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of travelers who plan smarter, not harder.
                Start with our free tier - no credit card required.
              </p>
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:shadow-xl transition-shadow"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">WanderPlan</span>
            </div>
            <p className="text-muted text-sm">
              Made with love for travelers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
