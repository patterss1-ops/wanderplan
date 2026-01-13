import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TripClient from './TripClient';

interface TripPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch trip with members and items
  const { data: trip, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_members(
        *,
        profile:profiles(*)
      ),
      saved_items(*)
    `)
    .eq('id', id)
    .single();

  if (error || !trip) {
    notFound();
  }

  // Check if user is a member
  const isMember = trip.trip_members.some(
    (member: { user_id: string }) => member.user_id === user.id
  );

  if (!isMember) {
    notFound();
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <TripClient
      trip={trip}
      user={user}
      profile={profile}
    />
  );
}
