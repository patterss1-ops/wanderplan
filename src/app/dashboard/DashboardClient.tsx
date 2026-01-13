'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MapPin,
  Plus,
  Settings,
  LogOut,
  Calendar,
  Users,
  MoreHorizontal,
  Search,
  Plane
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile, Trip } from '@/types/database';

interface TripWithCount extends Trip {
  saved_items: { count: number }[];
}

interface DashboardClientProps {
  user: User;
  profile: Profile | null;
  initialTrips: TripWithCount[];
}

export default function DashboardClient({ user, profile, initialTrips }: DashboardClientProps) {
  const router = useRouter();
  const [trips, setTrips] = useState<TripWithCount[]>(initialTrips);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCreateTrip = async (name: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('trips')
      .insert({
        name,
        start_date: startDate || null,
        end_date: endDate || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trip:', error);
      setLoading(false);
      return;
    }

    // Navigate to the new trip
    router.push(`/trip/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card p-4 flex flex-col">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">WanderPlan</span>
        </Link>

        {/* New Trip Button */}
        <button
          onClick={() => setShowNewTripModal(true)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all mb-6"
        >
          <Plus className="w-5 h-5" />
          New Trip
        </button>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
          >
            <Plane className="w-5 h-5" />
            My Trips
          </Link>
        </nav>

        {/* User menu */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name || 'Traveler'}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-muted/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Trips</h1>
            <p className="text-muted">Plan your next adventure</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        {/* Trips grid */}
        {filteredTrips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Plane className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No trips yet</h2>
            <p className="text-muted mb-6">Create your first trip to start planning</p>
            <button
              onClick={() => setShowNewTripModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create First Trip
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* New Trip Modal */}
      <AnimatePresence>
        {showNewTripModal && (
          <NewTripModal
            onClose={() => setShowNewTripModal(false)}
            onCreate={handleCreateTrip}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TripCard({ trip, index }: { trip: TripWithCount; index: number }) {
  const itemCount = trip.saved_items?.[0]?.count || 0;

  // Generate a gradient based on trip name for visual variety
  const gradients = [
    'from-blue-400 to-purple-500',
    'from-orange-400 to-pink-500',
    'from-green-400 to-cyan-500',
    'from-purple-400 to-indigo-500',
    'from-pink-400 to-rose-500',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/trip/${trip.id}`}
        className="block group"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl transition-all">
          {/* Cover image */}
          <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
            {trip.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trip.cover_image_url}
                alt={trip.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane className="w-12 h-12 text-white/50" />
              </div>
            )}
            {/* Status badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                trip.status === 'planning' ? 'bg-blue-500/80 text-white' :
                trip.status === 'booking' ? 'bg-orange-500/80 text-white' :
                trip.status === 'booked' ? 'bg-green-500/80 text-white' :
                'bg-gray-500/80 text-white'
              }`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-500 transition-colors">
              {trip.name}
            </h3>

            <div className="flex items-center gap-4 text-sm text-muted">
              {trip.start_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(trip.start_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{itemCount} places</span>
              </div>
            </div>
          </div>

          {/* More options */}
          <button
            className="absolute top-3 left-3 p-1.5 bg-black/20 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Show options menu
            }}
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

function NewTripModal({
  onClose,
  onCreate,
  loading,
}: {
  onClose: () => void;
  onCreate: (name: string, startDate?: string, endDate?: string) => void;
  loading: boolean;
}) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, startDate || undefined, endDate || undefined);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl shadow-2xl z-50 p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Create New Trip</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tripName" className="block text-sm font-medium mb-2">
              Trip Name *
            </label>
            <input
              id="tripName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Australia 2027"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl font-medium hover:bg-muted/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
