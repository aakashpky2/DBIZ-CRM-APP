CREATE TABLE IF NOT EXISTS student_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'System Default',
  language VARCHAR(50) DEFAULT 'English',
  email_notifications BOOLEAN DEFAULT true,
  learning_reminders BOOLEAN DEFAULT true,
  credit_alerts BOOLEAN DEFAULT true,
  course_updates BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE student_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for student_settings
CREATE POLICY "Users can view own settings"
ON student_settings FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own settings"
ON student_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own settings"
ON student_settings FOR UPDATE
TO authenticated
USING (auth.uid() = student_id);
