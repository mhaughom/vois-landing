-- Add product column to distinguish VOIS vs HABOS signups
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS product text NOT NULL DEFAULT 'vois';

-- Index for filtering by product
CREATE INDEX IF NOT EXISTS idx_waitlist_product ON waitlist(product);

-- Backfill: existing rows stay as 'vois' (the default)
