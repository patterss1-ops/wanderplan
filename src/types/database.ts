// Database types matching our Supabase schema

export type SubscriptionTier = 'free' | 'pro';
export type TripStatus = 'planning' | 'booking' | 'booked' | 'completed';
export type MemberRole = 'owner' | 'editor' | 'viewer';
export type ItemCategory = 'accommodation' | 'activity' | 'transport' | 'food' | 'other';
export type BookingStatus = 'idea' | 'researching' | 'ready' | 'booked';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: MemberRole;
  invited_email: string | null;
  invited_at: string;
  joined_at: string | null;
}

export interface SavedItem {
  id: string;
  trip_id: string;
  url: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  category: ItemCategory | null;
  place_name: string | null;
  latitude: number | null;
  longitude: number | null;
  booking_status: BookingStatus;
  is_anchor: boolean;
  price_estimate: number | null;
  currency: string;
  image_url: string | null;
  favicon_url: string | null;
  saved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  date: string;
  notes: string | null;
}

export interface ItineraryItem {
  id: string;
  day_id: string;
  saved_item_id: string | null;
  custom_title: string | null;
  custom_notes: string | null;
  time_slot: TimeSlot | null;
  start_time: string | null;
  position: number;
  is_anchor: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  saved_item_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export interface Document {
  id: string;
  trip_id: string;
  saved_item_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// Extended types with relations
export interface TripWithMembers extends Trip {
  trip_members: (TripMember & { profile?: Profile })[];
}

export interface SavedItemWithComments extends SavedItem {
  comments: Comment[];
  saved_by_profile?: Profile;
}

export interface ItineraryDayWithItems extends ItineraryDay {
  itinerary_items: (ItineraryItem & { saved_item?: SavedItem })[];
}

// Database type for Supabase client - using proper structure
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          subscription_expires_at?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          subscription_expires_at?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trips: {
        Row: Trip;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_image_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: TripStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: TripStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trip_members: {
        Row: TripMember;
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          role?: MemberRole;
          invited_email?: string | null;
          invited_at?: string;
          joined_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          role?: MemberRole;
          invited_email?: string | null;
          invited_at?: string;
          joined_at?: string | null;
        };
        Relationships: [];
      };
      saved_items: {
        Row: SavedItem;
        Insert: {
          id?: string;
          trip_id: string;
          url?: string | null;
          title: string;
          description?: string | null;
          notes?: string | null;
          category?: ItemCategory | null;
          place_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          booking_status?: BookingStatus;
          is_anchor?: boolean;
          price_estimate?: number | null;
          currency?: string;
          image_url?: string | null;
          favicon_url?: string | null;
          saved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          url?: string | null;
          title?: string;
          description?: string | null;
          notes?: string | null;
          category?: ItemCategory | null;
          place_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          booking_status?: BookingStatus;
          is_anchor?: boolean;
          price_estimate?: number | null;
          currency?: string;
          image_url?: string | null;
          favicon_url?: string | null;
          saved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      itinerary_days: {
        Row: ItineraryDay;
        Insert: {
          id?: string;
          trip_id: string;
          date: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          date?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      itinerary_items: {
        Row: ItineraryItem;
        Insert: {
          id?: string;
          day_id: string;
          saved_item_id?: string | null;
          custom_title?: string | null;
          custom_notes?: string | null;
          time_slot?: TimeSlot | null;
          start_time?: string | null;
          position: number;
          is_anchor?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          saved_item_id?: string | null;
          custom_title?: string | null;
          custom_notes?: string | null;
          time_slot?: TimeSlot | null;
          start_time?: string | null;
          position?: number;
          is_anchor?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: {
          id?: string;
          saved_item_id: string;
          user_id?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          saved_item_id?: string;
          user_id?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: Document;
        Insert: {
          id?: string;
          trip_id: string;
          saved_item_id?: string | null;
          file_name: string;
          file_path: string;
          file_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          saved_item_id?: string | null;
          file_name?: string;
          file_path?: string;
          file_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
