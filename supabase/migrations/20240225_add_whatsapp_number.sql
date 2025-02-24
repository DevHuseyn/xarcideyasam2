-- Add whatsapp_number column to books table
ALTER TABLE public.books
ADD COLUMN whatsapp_number text NOT NULL DEFAULT '+994504540738';

-- Add whatsapp_number column to featured_books table
ALTER TABLE public.featured_books
ADD COLUMN whatsapp_number text NOT NULL DEFAULT '+994504540738';

-- Update existing records with default number
UPDATE public.books
SET whatsapp_number = '+994504540738'
WHERE whatsapp_number IS NULL;

UPDATE public.featured_books
SET whatsapp_number = '+994504540738'
WHERE whatsapp_number IS NULL; 