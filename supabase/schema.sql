-- Create the events table
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    page_url TEXT NOT NULL,
    viewport JSONB,
    element JSONB,
    position JSONB,
    scroll_data JSONB
);

-- Create indexes to make your dashboard queries faster
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_event_type ON events(event_type);