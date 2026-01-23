-- Create a public bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create a policy to allow anyone to view avatars
CREATE POLICY "Avatar Public View" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Create a policy to allow authenticated users (or everyone for now) to upload avatars
-- Note: In a strict app, restrict INSERT to authenticated users
CREATE POLICY "Avatar Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatars' );

-- Create a public bucket for article images (if needed later)
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

CREATE POLICY "Image Public View" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'images' );

CREATE POLICY "Image Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'images' );
