-- Stripe payments: bookings can now be 'pending' (waiting for payment) or 'expired' (never paid),
-- and remember what was charged. SQLite can't change a CHECK constraint, so the table is rebuilt.
CREATE TABLE bookings_new (
  code TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  guests INTEGER NOT NULL,
  total INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'requested', 'cancelled', 'expired')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  amount_paid INTEGER NOT NULL DEFAULT 0,   -- whole USD actually charged
  amount_due INTEGER NOT NULL DEFAULT 0,    -- whole USD to charge at checkout (full total or 50% deposit)
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  refunded INTEGER NOT NULL DEFAULT 0       -- whole USD refunded
);
INSERT INTO bookings_new (code, listing_id, user_id, check_in, check_out, guests, total, guest_name, email, phone, message, status, created_at)
  SELECT code, listing_id, user_id, check_in, check_out, guests, total, guest_name, email, phone, message, status, created_at FROM bookings;
DROP TABLE bookings;
ALTER TABLE bookings_new RENAME TO bookings;
CREATE INDEX bookings_listing ON bookings(listing_id, check_in);
CREATE INDEX bookings_user ON bookings(user_id);
CREATE INDEX bookings_email ON bookings(email);
CREATE UNIQUE INDEX bookings_stripe_session ON bookings(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
