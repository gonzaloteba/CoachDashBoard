-- Add transcript_summary column to calls table
-- Stores a brief AI-generated summary of the call for quick context
ALTER TABLE calls ADD COLUMN IF NOT EXISTS transcript_summary TEXT;

-- Add comment for documentation
COMMENT ON COLUMN calls.transcript_summary IS 'Brief AI-generated summary of the call transcript for quick context';
