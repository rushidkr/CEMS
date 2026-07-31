-- CEMS seed data
-- Run this after the application has started once (so Hibernate creates the tables via ddl-auto=update)

-- Default admin account (password: Admin@123 — bcrypt hash below)
-- Generate your own hash with: new BCryptPasswordEncoder().encode("Admin@123")
INSERT INTO users (full_name, email, password, role, enabled, created_at)
VALUES ('System Admin', 'admin@cems.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', true, NOW());

-- Sample venues
INSERT INTO venues (name, location, capacity, facilities, active) VALUES
('Main Auditorium', 'Block A, Ground Floor', 500, 'Projector, Sound System, AC', true),
('Seminar Hall 1', 'Block B, First Floor', 120, 'Projector, AC', true),
('Open Air Theatre', 'Sports Complex', 1000, 'Stage, Lighting', true),
('Computer Lab 3', 'Block C, Second Floor', 60, 'Computers, Projector', true);
