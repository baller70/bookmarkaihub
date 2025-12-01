-- Add logo column to Category table if it doesn't exist
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "logo" TEXT;
