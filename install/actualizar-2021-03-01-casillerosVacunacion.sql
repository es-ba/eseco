set search_path= encu;
SET role eseco211_muleto_owner;
INSERT INTO encu.casilleros(operativo, id_casillero, padre, tipoc, casillero, orden, nombre, tipovar, longitud, tipoe, aclaracion, salto, unidad_analisis, cantidad_resumen, irrepetible, despliegue, ver_id, optativo, formulario_principal, var_name, var_name_especial, expresion_habilitar, valor_ns_nc, valor_sin_dato) VALUES 
('ESECO', 'V', 'F:F3', 'B', 'V', 1400, 'Datos de Vacunación', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V1', 'V', 'P', 'V1', 1405, '¿Recibió ls vacuna contra el COVID-19?', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, 'v1', NULL, NULL, NULL, NULL),
('ESECO', 'V1/1', 'V1', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, 'E1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V1/2', 'V1', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V2', 'V', 'P', 'V2', 1410, '¿Se aplicaría la vacuna contra el COVID-19', 'opciones', NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, 'v2', NULL, NULL, NULL, NULL),
('ESECO', 'V2/1', 'V2', 'O', '1', 1, 'Sí, ni bien tenga la posibilidad.', NULL, NULL, NULL, NULL, 'E1', NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V2/2', 'V2', 'O', '2', 2, 'Sí, pero prefiere esperar.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V2/3', 'V2', 'O', '3', 3, 'No se aplicaría la vacuna.', NULL, NULL, NULL, NULL, 'V4', NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V3', 'V', 'P', 'V3', 1415, 'Prefiere esperar...', 'opciones', NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, 'v3', NULL, NULL, NULL, NULL),
('ESECO', 'V3/1', 'V3', 'O', '1', 1, 'hasta 3 meses.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V3/2', 'V3', 'O', '2', 2, 'de 3 a 6 meses.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V3/3', 'V3', 'O', '3', 3, 'más de 6 meses.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4', 'V', 'P', 'V4', 1420, '¿Por qué motivo postergaría la vacunación o no se vacunaría?', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/1', 'V4', 'OM', '1', 1421, 'Considera que las fases de prueba de la vacuna pasaron muy rápido.', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'v4_1', NULL, NULL, NULL, NULL),
('ESECO', 'V4/1/1', 'V4/1', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/1/2', 'V4/1', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/2', 'V4', 'OM', '2', 1423, 'Le preocupan posibles efectos secundarios.', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'v4_2', NULL, NULL, NULL, NULL),
('ESECO', 'V4/2/1', 'V4/2', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/2/2', 'V4/2', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/3', 'V4', 'OM', '3', 1425, 'Considera que no es efectiva.', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'v4_3', NULL, NULL, NULL, NULL),
('ESECO', 'V4/3/1', 'V4/3', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/3/2', 'V4/3', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/4', 'V4', 'OM', '4', 1427, 'Está expuesto a poco riesgo de contagio de COVID-19.', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'v4_4', NULL, NULL, NULL, NULL),
('ESECO', 'V4/4/1', 'V4/4', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/4/2', 'V4/4', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/5', 'V4', 'OM', '5', 1429, 'Considera que no es necesario aplicarse vacunas', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'v4_5', NULL, NULL, NULL, NULL),
('ESECO', 'V4/5/1', 'V4/5', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/5/2', 'V4/5', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/6', 'V4', 'OM', '6', 1430, 'Otro motivo', 'si_no', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'leer', NULL, NULL, NULL, 'v4_6', NULL, NULL, NULL, NULL),
('ESECO', 'V4/6/1', 'V4/6', 'O', '1', 1, 'Sí', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('ESECO', 'V4/6/2', 'V4/6', 'O', '2', 2, 'No', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--falta especifique de v4_6

update casilleros set salto='V1'  where id_casillero='T1/2' and  salto='E1';
