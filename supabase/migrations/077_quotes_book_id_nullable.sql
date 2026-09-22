-- Scraped quotes may not match a books.id yet
ALTER TABLE quotes ALTER COLUMN book_id DROP NOT NULL;
