-- Seed: Insert all 34 active clients from Google Sheets
-- Only clients with estatus = "Activo" are included

INSERT INTO clients (first_name, last_name, status, plan_type, start_date, end_date, renewal_date, current_phase, phase_change_date, timezone, closer, onboarding_trainingpeaks, onboarding_whatsapp_group, onboarding_community_group) VALUES

-- id 10: Elías Fernandez
('Elías', 'Fernandez', 'active', '6_months', '2026-01-07', '2026-07-07', '2026-07-07', 3, NULL, 'America/Mexico_City', 'Andrés T', TRUE, FALSE, FALSE),

-- id 19: Israel Villa
('Israel', 'Villa', 'active', '3_months', '2026-01-07', '2026-04-07', '2026-04-07', 3, NULL, 'America/Mexico_City', 'Facundo C', TRUE, FALSE, TRUE),

-- id 23: Santiago Arce
('Santiago', 'Arce', 'active', '6_months', '2026-01-12', '2026-07-12', '2026-07-12', 2, '2026-02-21', 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 40: Kelvin Iribe
('Kelvin', 'Iribe', 'active', '4_months', '2026-01-12', '2026-05-12', '2026-05-12', 2, '2026-02-21', 'America/Mazatlan', 'Facundo C', TRUE, FALSE, FALSE),

-- id 41: Miguel Lendoff
('Miguel', 'Lendoff', 'active', '3_months', '2026-01-19', '2026-04-19', '2026-04-19', 2, '2026-02-28', 'America/Santo_Domingo', 'Facundo C', TRUE, FALSE, FALSE),

-- id 43: Carlos Rivera
('Carlos', 'Rivera', 'active', '6_months', '2026-01-19', '2026-07-19', '2026-07-19', 2, '2026-02-28', 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 47: Cristian Pacheco
('Cristian', 'Pacheco', 'active', '4_months', '2025-09-29', '2026-01-29', '2026-01-29', 3, NULL, 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 48: Jesús Demuner
('Jesús', 'Demuner', 'active', '6_months', '2025-09-29', '2026-03-29', '2026-03-29', 2, '2025-11-08', 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 49: Jesús Romero
('Jesús', 'Romero', 'active', '4_months', '2025-09-29', '2026-01-29', '2026-01-29', 3, NULL, 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 55: Nacho Porcar
('Nacho', 'Porcar', 'active', '4_months', '2025-10-20', '2026-02-20', '2026-02-20', 3, NULL, 'Europe/Madrid', 'Facundo C', TRUE, FALSE, FALSE),

-- id 56: Juan Pablo Martinez A
('Juan Pablo', 'Martinez A', 'active', '4_months', '2025-10-20', '2026-02-20', '2026-02-20', 1, '2025-10-27', 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 57: Alejandro Barron
('Alejandro', 'Barron', 'active', '4_months', '2025-10-27', '2026-02-27', '2026-02-27', 1, '2025-11-03', 'America/Mexico_City', 'Facundo C', TRUE, FALSE, FALSE),

-- id 59: José Palma
('José', 'Palma', 'active', '4_months', '2025-11-24', '2026-03-24', '2026-03-24', 2, '2026-01-03', 'Europe/Madrid', 'Facundo C', TRUE, FALSE, FALSE),

-- id 62: Eduardo Medina
('Eduardo', 'Medina', 'active', '4_months', '2026-01-05', '2026-05-05', '2026-05-05', 1, '2026-01-12', 'Europe/Madrid', 'Felipe S', TRUE, FALSE, FALSE),

-- id 63: Ernesto Castañeda
('Ernesto', 'Castañeda', 'active', '4_months', '2026-01-05', '2026-05-05', '2026-05-05', 3, NULL, 'America/Mexico_City', 'Felipe S', FALSE, FALSE, FALSE),

-- id 64: Mauro Gonzalez
('Mauro', 'Gonzalez', 'active', '6_months', '2026-01-05', '2026-07-05', '2026-07-05', 3, NULL, 'Europe/Madrid', 'Andrés T', TRUE, FALSE, FALSE),

-- id 65: Hector Flores Lara
('Hector', 'Flores Lara', 'active', '4_months', '2025-12-15', '2026-04-15', '2026-04-15', 3, NULL, 'America/Mexico_City', 'Felipe S', TRUE, FALSE, FALSE),

-- id 66: André Bilse
('André', 'Bilse', 'active', '3_months', '2026-01-12', '2026-04-12', '2026-04-12', 2, '2026-02-21', 'America/Mexico_City', 'Andrés T', TRUE, FALSE, FALSE),

-- id 69: Leonel Alejandro Vizcaino
('Leonel Alejandro', 'Vizcaino', 'active', '6_months', '2026-01-05', '2026-07-05', '2026-07-05', 2, '2026-02-14', 'America/Mexico_City', 'Andrés T', TRUE, FALSE, FALSE),

-- id 70: Hermes Octavio Contla Gutiérrez
('Hermes Octavio', 'Contla Gutiérrez', 'active', '3_months', '2026-01-12', '2026-04-12', '2026-04-12', 3, NULL, 'America/Mexico_City', 'Andrés T', TRUE, FALSE, FALSE),

-- id 71: Davide Fedrizzi
('Davide', 'Fedrizzi', 'active', '6_months', '2026-01-12', '2026-07-12', '2026-07-12', 3, NULL, 'Europe/Madrid', 'Andrés T', TRUE, FALSE, FALSE),

-- id 72: Christian Lopez
('Christian', 'Lopez', 'active', '6_months', '2026-01-12', '2026-07-12', '2026-07-12', 1, '2026-01-19', 'America/Bogota', 'Andrés T', TRUE, FALSE, FALSE),

-- id 73: Elvis Rodriguez
('Elvis', 'Rodriguez', 'active', '6_months', '2026-01-12', '2026-07-12', '2026-07-12', 3, NULL, 'America/Mexico_City', 'Andrés T', TRUE, FALSE, FALSE),

-- id 75: Abdi Campos
('Abdi', 'Campos', 'active', '12_months', '2026-01-12', '2027-01-12', '2027-01-12', 2, '2026-02-21', 'America/Mexico_City', 'Santiago L', TRUE, FALSE, FALSE),

-- id 76: Alejandro Ramones Iacoviello
('Alejandro', 'Ramones Iacoviello', 'active', '6_months', '2026-02-02', '2026-08-02', '2026-08-02', 2, '2026-03-14', 'Atlantic/Canary', 'Santiago L', TRUE, FALSE, FALSE),

-- id 77: Christian Garcia
('Christian', 'Garcia', 'active', '3_months', '2026-02-09', '2026-05-09', '2026-05-09', 2, '2026-03-21', 'Europe/Madrid', 'Santiago L', TRUE, FALSE, FALSE),

-- id 78: Pablo Lozano
('Pablo', 'Lozano', 'active', '3_months', '2026-02-09', '2026-05-09', '2026-05-09', 2, '2026-03-21', 'Europe/Madrid', 'Santiago L', TRUE, FALSE, FALSE),

-- id 79: Pablo Aviles
('Pablo', 'Aviles', 'active', '3_months', '2026-02-09', '2026-05-09', '2026-05-09', 2, '2026-03-21', 'America/Mexico_City', 'Andrés T', TRUE, TRUE, TRUE),

-- id 80: Rafael Pineda
('Rafael', 'Pineda', 'active', '6_months', '2026-02-09', '2026-08-09', '2026-08-09', 1, '2026-02-16', 'America/Mexico_City', 'Andrés T', TRUE, FALSE, FALSE),

-- id 81: Guillem Ribas
('Guillem', 'Ribas', 'active', '3_months', '2026-02-16', '2026-05-16', '2026-05-16', 1, '2026-02-23', 'Europe/Madrid', 'Santiago L', TRUE, TRUE, TRUE),

-- id 82: Elvis Florentino
('Elvis', 'Florentino', 'active', '3_months', '2026-02-26', '2026-05-26', '2026-05-26', 1, '2026-03-05', 'America/Santo_Domingo', 'Santiago L', TRUE, TRUE, FALSE),

-- id 83: Juan Pablo Cordero
('Juan Pablo', 'Cordero', 'active', '3_months', '2026-02-23', '2026-05-23', '2026-05-23', 2, '2026-04-04', 'America/Mexico_City', 'Andrés T', TRUE, TRUE, TRUE),

-- id 84: Eduardo Lom
('Eduardo', 'Lom', 'active', '3_months', '2026-03-23', '2026-06-23', '2026-06-23', 1, '2026-03-30', 'America/Mexico_City', 'Santiago L', FALSE, FALSE, FALSE),

-- id 85: Erick Ortega
('Erick', 'Ortega', 'active', '3_months', '2026-03-16', '2026-06-16', '2026-06-16', 1, '2026-03-23', 'America/Mexico_City', 'Santiago L', FALSE, TRUE, TRUE);
