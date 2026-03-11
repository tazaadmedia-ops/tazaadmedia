-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone for public content
CREATE POLICY "Allow public read access on site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on live_updates" ON public.live_updates FOR SELECT USING (true);
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);

-- Allow public read access to published articles only (assuming a status or is_published column)
-- If no such column exists, we might need a simpler policy, but usually news sites filter by status.
-- I'll create a basic policy and we can refine it if needed.
CREATE POLICY "Allow public read access on published articles" ON public.articles FOR SELECT USING (status = 'published');

-- Allow public read access to authors and media
CREATE POLICY "Allow public read access on article_authors" ON public.article_authors FOR SELECT USING (true);
CREATE POLICY "Allow public read access on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access on media" ON public.media FOR SELECT USING (true);

-- For comments, usually everyone can read
CREATE POLICY "Allow public read access on comments" ON public.comments FOR SELECT USING (true);

-- For article_revisions, usually only admins/editors can read, so we don't add a public select policy

-- Allow all operations for authenticated users (admins/editors in Supabase)
-- This assumes standard Supabase authentication where authenticated users are staff
CREATE POLICY "Allow authenticated users to manage site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage live_updates" ON public.live_updates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage users" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage media" ON public.media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage article_authors" ON public.article_authors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage article_revisions" ON public.article_revisions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage comments" ON public.comments FOR ALL USING (auth.role() = 'authenticated');

