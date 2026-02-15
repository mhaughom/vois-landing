import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// DEBUG: Log to check if env vars are loaded
console.log('🔍 Supabase Config Check:');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseAnonKey.substring(0, 20));
console.log('Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase environment variables are missing!');
  console.error('URL empty:', !supabaseUrl);
  console.error('Key empty:', !supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our waitlist
export interface WaitlistEntry {
  id?: string;
  email: string;
  created_at?: string;
  referral_source?: string;
  use_cases?: string[];
  preferred_device?: string;
  posthog_distinct_id?: string;
  completed_demo?: boolean;
  watched_video?: boolean;
  metadata?: Record<string, any>;
}

// Waitlist service
export const waitlistService = {
  async addToWaitlist(data: WaitlistEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: entry, error } = await supabase
        .from('waitlist')
        .insert([{
          email: data.email,
          referral_source: data.referral_source,
          use_cases: data.use_cases,
          preferred_device: data.preferred_device,
          posthog_distinct_id: data.posthog_distinct_id,
          completed_demo: data.completed_demo,
          watched_video: data.watched_video,
          metadata: data.metadata,
        }])
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation (duplicate email)
        if (error.code === '23505') {
          return { success: false, error: 'This email is already on the waitlist!' };
        }
        console.error('Supabase error:', error);
        return { success: false, error: 'Failed to join waitlist. Please try again.' };
      }

      return { success: true };
    } catch (err) {
      console.error('Unexpected error:', err);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  },

  async checkIfEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Error checking email:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Unexpected error:', err);
      return false;
    }
  }
};
