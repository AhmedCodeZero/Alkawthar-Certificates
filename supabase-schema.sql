-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_data TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for admin access
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create logo table
CREATE TABLE IF NOT EXISTS app_logo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  height_px INTEGER DEFAULT 160,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_uploaded_at ON certificates(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logo ENABLE ROW LEVEL SECURITY;

-- Create policies for certificates
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON certificates;
CREATE POLICY "Allow all operations for authenticated users" ON certificates
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON certificates;
CREATE POLICY "Allow public read access" ON certificates
  FOR SELECT USING (true);

-- Create policies for settings (public read, admin write)
DROP POLICY IF EXISTS "Allow public read access to settings" ON app_settings;
CREATE POLICY "Allow public read access to settings" ON app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access to settings" ON app_settings;
CREATE POLICY "Allow admin write access to settings" ON app_settings
  FOR ALL USING (true);

-- Create policies for admin users (allow all operations for now)
DROP POLICY IF EXISTS "Allow admin access to users" ON admin_users;
CREATE POLICY "Allow admin access to users" ON admin_users
  FOR ALL USING (true);

-- Create policies for logo (public read, admin write)
DROP POLICY IF EXISTS "Allow public read access to logo" ON app_logo;
CREATE POLICY "Allow public read access to logo" ON app_logo
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access to logo" ON app_logo;
CREATE POLICY "Allow admin write access to logo" ON app_logo
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON app_settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_logo_updated_at ON app_logo;
CREATE TRIGGER update_logo_updated_at
  BEFORE UPDATE ON app_logo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('Dm@alkawthar.org.sa', 'مدير النظام', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Insert additional admin users
INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('admin@alkawthar.org.sa', 'مدير إضافي', 'admin', true)
ON CONFLICT (email) DO NOTHING;
