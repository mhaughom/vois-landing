import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing');
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
  product?: 'vois' | 'habos';
}

// Factory: creates a waitlist service bound to a specific product
export function createWaitlistService(product: 'vois' | 'habos') {
  return {
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
            product: data.product || product,
          }])
          .select()
          .single();

        if (error) {
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
}

// ── Configurable default instance ──
// Apps call configureWaitlist() at startup; shared components use waitlistService below.

let _waitlistService = createWaitlistService('vois');

export function configureWaitlist(product: 'vois' | 'habos') {
  _waitlistService = createWaitlistService(product);
}

export const waitlistService = {
  addToWaitlist: (...args: Parameters<ReturnType<typeof createWaitlistService>['addToWaitlist']>) =>
    _waitlistService.addToWaitlist(...args),
  checkIfEmailExists: (...args: Parameters<ReturnType<typeof createWaitlistService>['checkIfEmailExists']>) =>
    _waitlistService.checkIfEmailExists(...args),
};
