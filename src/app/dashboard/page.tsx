import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch user's trips
  const { data: trips } = await supabase
    .from('trips')
    .select(`
      *,
      trip_members!inner(user_id, role),
      saved_items(count)
    `)
    .order('updated_at', { ascending: false });

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <DashboardClient
      user={user}
      profile={profile}
      initialTrips={trips || []}
    />
  );
}
