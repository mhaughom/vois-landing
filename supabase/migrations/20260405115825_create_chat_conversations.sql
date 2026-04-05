CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  page text,
  message_count int NOT NULL DEFAULT 0,
  email_captured boolean NOT NULL DEFAULT false,
  booking_clicked boolean NOT NULL DEFAULT false,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_visitor ON chat_conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_date ON chat_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_email ON chat_conversations(email_captured) WHERE email_captured = true;

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON chat_conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON chat_conversations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "auth_read" ON chat_conversations FOR SELECT TO authenticated USING (true);
