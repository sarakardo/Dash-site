PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('passenger_request','driver_application','contact')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','driver_found','in_progress','completed','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  passenger_name TEXT,
  passenger_mobile TEXT,
  passenger_national_id_enc TEXT,
  owner_name TEXT,
  owner_mobile TEXT,
  owner_national_id_enc TEXT,
  for_whom TEXT,
  pickup TEXT,
  car_place TEXT,
  destination TEXT,
  requested_at TEXT,
  plate TEXT,
  car_model TEXT,
  vin TEXT,
  driver_name TEXT,
  driver_mobile TEXT,
  driver_national_id_enc TEXT,
  documents_json TEXT,
  contact_name TEXT,
  contact_method TEXT,
  contact_message TEXT,
  consent_at TEXT,
  privacy_version TEXT,
  notes TEXT,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_requests_type_created ON requests(type,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status_created ON requests(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_passenger_mobile ON requests(passenger_mobile);
CREATE INDEX IF NOT EXISTS idx_requests_driver_mobile ON requests(driver_mobile);
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(bucket_key,window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
CREATE TABLE IF NOT EXISTS admin_audit (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  request_id TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit(created_at DESC);
