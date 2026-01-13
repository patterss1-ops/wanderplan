'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  ArrowLeft,
  Calendar,
  Hotel,
  Plane,
  Utensils,
  Camera,
  MoreHorizontal,
  ExternalLink,
  Anchor,
  Search,
  Filter,
  Grid,
  List,
  Map as MapIcon,
  X,
  Loader2,
  Check
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import MapView from '@/components/MapView';
import type { User } from '@supabase/supabase-js';
import type { Profile, Trip, TripMember, SavedItem, ItemCategory, BookingStatus } from '@/types/database';

interface TripWithRelations extends Trip {
  trip_members: (TripMember & { profile: Profile })[];
  saved_items: SavedItem[];
}

interface TripClientProps {
  trip: TripWithRelations;
  user: User;
  profile: Profile | null;
}

const categoryIcons: Record<ItemCategory, typeof Hotel> = {
  accommodation: Hotel,
  activity: Camera,
  transport: Plane,
  food: Utensils,
  other: MapPin,
};

const categoryColors: Record<ItemCategory, string> = {
  accommodation: 'bg-blue-500',
  activity: 'bg-purple-500',
  transport: 'bg-orange-500',
  food: 'bg-green-500',
  other: 'bg-gray-500',
};

const statusColors: Record<BookingStatus, string> = {
  idea: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  researching: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ready: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  booked: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function TripClient({ trip: initialTrip, user, profile }: TripClientProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<TripWithRelations>(initialTrip);
  const [items, setItems] = useState<SavedItem[]>(initialTrip.saved_items || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Set up realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`trip:${trip.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_items',
          filter: `trip_id=eq.${trip.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as SavedItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as SavedItem) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trip.id]);

  const filteredItems = items
    .filter((item) => filterCategory === 'all' || item.category === filterCategory)
    .filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.place_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddItem = useCallback(async (itemData: Partial<SavedItem>) => {
    const supabase = createClient();

    const { error } = await supabase.from('saved_items').insert({
      trip_id: trip.id,
      saved_by: user.id,
      ...itemData,
    });

    if (error) {
      console.error('Error adding item:', error);
    }

    setShowAddModal(false);
  }, [trip.id, user.id]);

  const handleUpdateItemStatus = useCallback(async (itemId: string, status: BookingStatus) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('saved_items')
      .update({ booking_status: status })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
    }
  }, []);

  const handleToggleAnchor = useCallback(async (itemId: string, isAnchor: boolean) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('saved_items')
      .update({ is_anchor: isAnchor })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating anchor:', error);
    }
  }, []);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
    }
  }, []);

  const categoryCounts = items.reduce((acc, item) => {
    const cat = item.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-bold text-xl">{trip.name}</h1>
                {trip.start_date && (
                  <p className="text-sm text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(trip.start_date).toLocaleDateString()} -
                    {trip.end_date && new Date(trip.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Members */}
              <div className="flex -space-x-2">
                {trip.trip_members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                    title={member.profile?.full_name || 'Member'}
                  >
                    {member.profile?.full_name?.charAt(0) || '?'}
                  </div>
                ))}
              </div>

              {/* Add button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Place
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Categories */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      filterCategory === 'all'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'hover:bg-muted/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      All Places
                    </span>
                    <span className="text-sm bg-muted/20 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </button>

                  {(Object.keys(categoryIcons) as ItemCategory[]).map((cat) => {
                    const Icon = categoryIcons[cat];
                    const count = categoryCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          filterCategory === cat
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                            : 'hover:bg-muted/10'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </span>
                        <span className="text-sm bg-muted/20 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Mode */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-medium mb-3">View</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'hover:bg-muted/10'
                    }`}
                  >
                    <Grid className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'hover:bg-muted/10'
                    }`}
                  >
                    <List className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'map'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'hover:bg-muted/10'
                    }`}
                  >
                    <MapIcon className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-card rounded-2xl border border-border"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">No places saved yet</h2>
                <p className="text-muted mb-6">Start adding hotels, activities, and restaurants</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add First Place
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item, index) => (
                  <SavedItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdateStatus={handleUpdateItemStatus}
                    onToggleAnchor={handleToggleAnchor}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <SavedItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdateStatus={handleUpdateItemStatus}
                    onToggleAnchor={handleToggleAnchor}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            ) : (
              <MapView
                items={filteredItems.map(item => ({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  category: item.category,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  place_name: item.place_name,
                  booking_status: item.booking_status,
                  is_anchor: item.is_anchor,
                }))}
                className="h-[600px] rounded-2xl border border-border"
              />
            )}
          </main>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SavedItemCard({
  item,
  index,
  onUpdateStatus,
  onToggleAnchor,
  onDelete,
}: {
  item: SavedItem;
  index: number;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onToggleAnchor: (id: string, isAnchor: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = categoryIcons[item.category || 'other'];
  const color = categoryColors[item.category || 'other'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Image/Gradient header */}
      <div className={`h-32 ${color} relative`}>
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-10 h-10 text-white/50" />
          </div>
        )}

        {/* Anchor badge */}
        {item.is_anchor && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Anchor className="w-3 h-3" />
            Anchor
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/30 backdrop-blur text-white text-xs font-medium rounded-full capitalize">
          {item.category || 'Other'}
        </div>

        {/* Menu button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="absolute bottom-2 right-2 p-1.5 bg-black/30 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4 text-white" />
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-10 right-2 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[140px] z-10"
            >
              <button
                onClick={() => {
                  onToggleAnchor(item.id, !item.is_anchor);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/10 flex items-center gap-2"
              >
                <Anchor className="w-4 h-4" />
                {item.is_anchor ? 'Remove Anchor' : 'Set as Anchor'}
              </button>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted/10 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Link
                </a>
              )}
              <button
                onClick={() => {
                  onDelete(item.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/10 text-red-500 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
        {item.place_name && (
          <p className="text-sm text-muted mb-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {item.place_name}
          </p>
        )}

        {/* Status selector */}
        <div className="flex flex-wrap gap-1">
          {(['idea', 'researching', 'ready', 'booked'] as BookingStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onUpdateStatus(item.id, status)}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all ${
                item.booking_status === status
                  ? statusColors[status]
                  : 'bg-muted/10 text-muted hover:bg-muted/20'
              }`}
            >
              {status === item.booking_status && <Check className="w-3 h-3 inline mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SavedItemRow({
  item,
  index,
  onUpdateStatus,
  onToggleAnchor,
  onDelete,
}: {
  item: SavedItem;
  index: number;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onToggleAnchor: (id: string, isAnchor: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = categoryIcons[item.category || 'other'];
  const color = categoryColors[item.category || 'other'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{item.title}</h3>
          {item.is_anchor && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
              <Anchor className="w-3 h-3" />
              Anchor
            </span>
          )}
        </div>
        {item.place_name && (
          <p className="text-sm text-muted truncate">{item.place_name}</p>
        )}
      </div>

      {/* Status */}
      <select
        value={item.booking_status}
        onChange={(e) => onUpdateStatus(item.id, e.target.value as BookingStatus)}
        className={`px-3 py-1.5 text-sm font-medium rounded-full border-0 cursor-pointer ${statusColors[item.booking_status]}`}
      >
        <option value="idea">Idea</option>
        <option value="researching">Researching</option>
        <option value="ready">Ready</option>
        <option value="booked">Booked</option>
      </select>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleAnchor(item.id, !item.is_anchor)}
          className={`p-2 rounded-lg transition-colors ${
            item.is_anchor ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-muted/10'
          }`}
          title={item.is_anchor ? 'Remove anchor' : 'Set as anchor'}
        >
          <Anchor className="w-4 h-4" />
        </button>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function AddItemModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (data: Partial<SavedItem>) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{
    place_name: string;
    center: [number, number];
  }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'other' as ItemCategory,
    place_name: '',
    latitude: null as number | null,
    longitude: null as number | null,
    notes: '',
    price_estimate: '',
  });

  // Debounced geocoding search
  useEffect(() => {
    if (!formData.place_name || formData.place_name.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const timer = setTimeout(async () => {
      setGeocoding(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            formData.place_name
          )}.json?access_token=${token}&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setLocationSuggestions(
            data.features.map((f: { place_name: string; center: [number, number] }) => ({
              place_name: f.place_name,
              center: f.center,
            }))
          );
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setGeocoding(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.place_name]);

  const selectLocation = (suggestion: { place_name: string; center: [number, number] }) => {
    setFormData({
      ...formData,
      place_name: suggestion.place_name,
      longitude: suggestion.center[0],
      latitude: suggestion.center[1],
    });
    setLocationSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    onAdd({
      title: formData.title,
      url: formData.url || undefined,
      category: formData.category,
      place_name: formData.place_name || undefined,
      latitude: formData.latitude ?? undefined,
      longitude: formData.longitude ?? undefined,
      notes: formData.notes || undefined,
      price_estimate: formData.price_estimate ? parseFloat(formData.price_estimate) : undefined,
    });

    setLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-2xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Add Place</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sydney Opera House"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(categoryIcons) as ItemCategory[]).map((cat) => {
                const Icon = categoryIcons[cat];
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-border hover:border-blue-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-500' : 'text-muted'}`} />
                    <span className={`text-xs capitalize ${isSelected ? 'text-blue-500' : ''}`}>
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL (optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">Location (optional)</label>
            <div className="relative">
              <input
                type="text"
                value={formData.place_name}
                onChange={(e) => setFormData({ ...formData, place_name: e.target.value, latitude: null, longitude: null })}
                placeholder="e.g., Sydney, Australia"
                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {geocoding && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
              )}
              {formData.latitude && formData.longitude && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            {/* Location suggestions dropdown */}
            {locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectLocation(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/10 transition-colors flex items-center gap-3 border-b border-border last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
                    <span className="text-sm truncate">{suggestion.place_name}</span>
                  </button>
                ))}
              </div>
            )}
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-muted mt-1">
                Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price Estimate (optional)</label>
            <input
              type="number"
              value={formData.price_estimate}
              onChange={(e) => setFormData({ ...formData, price_estimate: e.target.value })}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any notes about this place..."
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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
              disabled={!formData.title || loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Place
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
