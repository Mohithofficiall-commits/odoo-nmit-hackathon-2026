INSERT INTO public.holidays (title, holiday_date, description) VALUES
  ('New Year''s Day', '2026-01-01', 'Official Public Holiday'),
  ('Republic Day', '2026-01-26', 'National Holiday'),
  ('Labor Day', '2026-05-01', 'International Workers'' Day'),
  ('Independence Day', '2026-08-15', 'National Holiday')
ON CONFLICT (holiday_date) DO NOTHING;

INSERT INTO public.announcements (title, content, category, is_pinned) VALUES
  ('Welcome to Dayflow HRMS', 'We are excited to launch our upgraded HR portal for Odoo Hackathon 2026!', 'general', true),
  ('Q3 Performance Reviews', 'Department leads will commence Q3 appraisals starting next Monday.', 'urgent', false)
ON CONFLICT DO NOTHING;
