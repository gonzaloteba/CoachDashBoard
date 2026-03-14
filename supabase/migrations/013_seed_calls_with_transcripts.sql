-- Seed: Sample calls with transcripts for testing UI
-- Uses subqueries to find client IDs by name (avoids hardcoded UUIDs)

-- Elías Fernandez: 3 calls (programa de 6 meses, fase 3)
INSERT INTO calls (client_id, call_date, duration_minutes, notes, transcript, meet_link) VALUES
(
  (SELECT id FROM clients WHERE first_name = 'Elías' AND last_name = 'Fernandez' LIMIT 1),
  '2026-01-14', 45,
  'Llamada de inicio. Revisamos objetivos, establecimos plan de alimentación fase 1 detox.',
  'Coach: Bueno Elías, bienvenido al programa. ¿Cómo te sientes al empezar?

Elías: Muy motivado, la verdad. Llevo tiempo queriendo mejorar mi alimentación pero no sabía por dónde empezar.

Coach: Perfecto. Vamos a empezar con la fase 1, que es la fase de detox. Durante los primeros 7 días vamos a eliminar azúcares añadidos, harinas refinadas y ultraprocesados.

Elías: Vale, ¿y qué puedo comer entonces?

Coach: Proteínas de calidad: pollo, pescado, huevos, carne. Verduras en abundancia, especialmente las de hoja verde. Grasas saludables como aguacate, aceite de oliva, frutos secos. Y frutas con bajo índice glucémico como frutos rojos.

Elías: ¿Y el café?

Coach: El café está permitido, pero sin azúcar. Puedes usar un poco de stevia si lo necesitas al principio. Lo importante es ir adaptando el paladar.

Elías: Entendido. ¿Cuántas comidas al día?

Coach: Te voy a poner 4 comidas: desayuno, comida, merienda y cena. Con las cantidades que te mandé en el plan. Lo importante es no saltarse ninguna y respetar los horarios lo más posible.

Elías: Perfecto, voy a darle con todo.

Coach: Genial. La próxima semana revisamos cómo te fue. Cualquier duda me escribes al WhatsApp.',
  'https://meet.google.com/abc-defg-hij'
),
(
  (SELECT id FROM clients WHERE first_name = 'Elías' AND last_name = 'Fernandez' LIMIT 1),
  '2026-02-11', 30,
  'Revisión fase 1 completada. Buena adherencia. Transición a fase 2 reintroducción.',
  'Coach: Elías, ¿cómo fue esta primera fase de detox?

Elías: Bastante bien. Los primeros 3 días fueron difíciles, tenía muchos antojos de dulce, pero después se fue quitando.

Coach: Eso es totalmente normal. El cuerpo necesita unos días para adaptarse. ¿Cómo te sientes ahora en cuanto a energía?

Elías: Mucho mejor, la verdad. Duermo mejor y me levanto con más energía. Ya no tengo ese bajón de las 3 de la tarde.

Coach: Excelente. ¿Has notado cambios en la composición corporal?

Elías: Sí, bajé 2.5 kilos según la báscula. Y la ropa me queda un poco más holgada en la cintura.

Coach: Perfecto. Ahora vamos a pasar a la fase 2, que es la de reintroducción. Vamos a ir metiendo carbohidratos complejos de forma controlada: arroz, avena, boniato, legumbres.

Elías: ¿Todos los días?

Coach: Sí, pero en cantidades controladas y preferiblemente alrededor del entrenamiento. Te voy a actualizar el plan esta tarde con las cantidades exactas.

Elías: Genial, gracias.',
  'https://meet.google.com/klm-nopq-rst'
),
(
  (SELECT id FROM clients WHERE first_name = 'Elías' AND last_name = 'Fernandez' LIMIT 1),
  '2026-03-11', 25,
  'Seguimiento fase 2. Bajó 4kg total. Buena tolerancia a carbohidratos. Planificando fase 3.',
  NULL,
  'https://meet.google.com/uvw-xyza-bcd'
);

-- Santiago Arce: 2 calls (programa de 6 meses, fase 2)
INSERT INTO calls (client_id, call_date, duration_minutes, notes, transcript, meet_link) VALUES
(
  (SELECT id FROM clients WHERE first_name = 'Santiago' AND last_name = 'Arce' LIMIT 1),
  '2026-01-19', 40,
  'Llamada inicial. Revisamos auditoría, historial de entrenamiento y objetivos de recomposición.',
  'Coach: Santiago, bienvenido. He revisado tu auditoría inicial y veo que entrenas 5 días a la semana. ¿Es correcto?

Santiago: Sí, hago push-pull-legs dos veces por semana y un día de descanso activo.

Coach: Perfecto, muy buen volumen. ¿Cómo es tu alimentación actualmente?

Santiago: Bastante desordenada. Como bien entre semana pero los fines de semana se me va de las manos. Muchas comidas fuera, alcohol los sábados.

Coach: Entiendo. Vamos a trabajar en eso. Para la fase 1 detox lo más importante va a ser limpiar esos fines de semana. No digo que no salgas, pero vamos a buscar alternativas.

Santiago: ¿Cómo cuáles?

Coach: Si sales a comer, elige proteína + ensalada. Si bebes, mejor un destilado con agua mineral que cerveza o cócteles. Y el domingo es día de preparar comidas para la semana.

Santiago: Me gusta la idea del meal prep del domingo.

Coach: Es clave. Te va a ahorrar tiempo entre semana y te asegura que siempre tengas comida limpia disponible. Te mando unas recetas sencillas que puedes preparar en batch.',
  'https://meet.google.com/efg-hijk-lmn'
),
(
  (SELECT id FROM clients WHERE first_name = 'Santiago' AND last_name = 'Arce' LIMIT 1),
  '2026-02-16', 30,
  'Seguimiento fase 2. Mejoró adherencia fines de semana. Revisamos plan de suplementación.',
  'Coach: Santiago, ¿cómo van esos fines de semana?

Santiago: Mucho mejor. El meal prep del domingo me cambió la vida. Ahora preparo pollo, arroz y verduras para 3 días y ya no tengo excusa.

Coach: Me alegra. ¿Y las salidas?

Santiago: He reducido el alcohol a una vez cada 15 días. Y cuando salgo a comer elijo mejor.

Coach: Genial. En cuanto a suplementación, ¿estás tomando la creatina?

Santiago: Sí, 5g diarios con el batido post-entreno.

Coach: Perfecto. Vamos a añadir magnesio por las noches, te va a ayudar con la recuperación y el sueño. 400mg de bisglicinato antes de dormir.

Santiago: Vale, lo compro esta semana.',
  'https://meet.google.com/opq-rstu-vwx'
);

-- Pablo Lozano: 1 call (programa de 3 meses, fase 2, reciente)
INSERT INTO calls (client_id, call_date, duration_minutes, notes, transcript, meet_link) VALUES
(
  (SELECT id FROM clients WHERE first_name = 'Pablo' AND last_name = 'Lozano' LIMIT 1),
  '2026-02-16', 35,
  'Llamada de inicio. Contexto: trabaja desde casa, sedentario, quiere perder grasa y ganar energía.',
  'Coach: Pablo, bienvenido. Veo que estás en Madrid y trabajas desde casa. ¿Cómo es un día típico tuyo?

Pablo: Me levanto sobre las 8, me pongo a trabajar directamente. Como a las 2, generalmente algo rápido. Ceno sobre las 9-10 de la noche.

Coach: ¿Y el entrenamiento?

Pablo: Voy al gym por las tardes, sobre las 6. Hago 4 días: 2 de upper y 2 de lower.

Coach: Bien. Un problema que veo es que te saltas el desayuno y luego llegas a la comida con mucha hambre. ¿Es así?

Pablo: Sí, a veces como de más porque llego muerto de hambre.

Coach: Vamos a meter un desayuno sencillo. No tiene que ser elaborado: unos huevos revueltos con una tostada de pan de centeno y un café. En 5 minutos lo tienes.

Pablo: Puedo hacer eso, sí.

Coach: Y la cena la vamos a adelantar un poco. Cenar a las 9 como tarde. Así mejoramos el descanso también.

Pablo: Vale, lo intento esta semana.

Coach: Perfecto. Te mando el plan detallado hoy por la tarde. Cualquier duda, al WhatsApp.',
  'https://meet.google.com/yza-bcde-fgh'
);
