-- Add logo column to Category table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='Category' AND column_name='logo'
    ) THEN
        ALTER TABLE "Category" ADD COLUMN "logo" TEXT;
    END IF;
END $$;
