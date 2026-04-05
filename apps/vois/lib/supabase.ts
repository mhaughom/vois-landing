import { supabase, createWaitlistService } from '@li/shared/lib/supabase';

export { supabase };
export const waitlistService = createWaitlistService('vois');
