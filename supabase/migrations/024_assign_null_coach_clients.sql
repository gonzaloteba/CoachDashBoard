-- Reassign ALL clients and calls to Antonio Tirado (db4b2870-a7a4-4352-bcd7-02dc533d6866)
-- This fixes clients that may have been assigned to the wrong coach

UPDATE public.clients
SET coach_id = 'db4b2870-a7a4-4352-bcd7-02dc533d6866'
WHERE coach_id IS NULL
   OR coach_id != 'db4b2870-a7a4-4352-bcd7-02dc533d6866';

UPDATE public.calls
SET coach_id = 'db4b2870-a7a4-4352-bcd7-02dc533d6866'
WHERE coach_id IS NULL
   OR coach_id != 'db4b2870-a7a4-4352-bcd7-02dc533d6866';
