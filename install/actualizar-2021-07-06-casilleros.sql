set search_path= encu;
SET role eseco211_muleto_owner;

delete from casilleros where id_casillero~'^P7/\d$' or id_casillero='P7';
delete from casilleros c  
  where id_casillero~'^V1_\d/\d$' ;
delete from casilleros c  
  where id_casillero~'^V1_' and tipoc in('P','FILTRO') ;

--pregunta sobre dengue
INSERT INTO casilleros (operativo, id_casillero, padre, tipoc, casillero, orden, nombre, tipovar, longitud, tipoe, aclaracion, salto, unidad_analisis, cantidad_resumen, irrepetible, despliegue, ver_id, optativo, formulario_principal, var_name, var_name_especial, expresion_habilitar, valor_ns_nc, valor_sin_dato, leer, calculada, libre, especial) VALUES
('ESECO','P7','LP','P','P7',170,'¿Alguna vez un médico o personal de salud le dijo que tenía dengue?','si_no',NULL,NULL,NULL,NULL,'personas',NULL,True,NULL,NULL,NULL,NULL,'p7',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('ESECO','P7/1','P7','O','1',1,'Sí',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('ESECO','P7/2','P7','O','2',2,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);

--cambiar saltos de la V1
update casilleros set salto= null where operativo='ESECO' AND id_casillero='V1/1';
update casilleros set salto= 'V2' where operativo='ESECO' AND id_casillero='V1/2';
--correr los ordenes para generar lugar a las nuevas preguntas
update casilleros set orden= orden + 20 where operativo='ESECO' AND id_casillero ~'^V(2|3|4)$' and tipoc='P';
--nuevos casilleros sobre vacunacion
INSERT INTO casilleros (operativo, id_casillero, padre, tipoc, casillero, orden, nombre, tipovar, longitud, tipoe, aclaracion, salto, unidad_analisis, cantidad_resumen, irrepetible, despliegue, ver_id, optativo, formulario_principal, var_name, var_name_especial, expresion_habilitar, valor_ns_nc, valor_sin_dato, leer, calculada, libre, especial) VALUES
  ('ESECO', 'V1_1', 'V', 'P', 'V1_1', 1408, '¿Cuántas dosis recibió?', 'opciones', NULL, NULL, NULL, NULL, NULL, NULL, true, 'si_leer', NULL, NULL, NULL, 'v1_1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_2', 'V', 'P', 'V1_2', 1412, '¿En qué fecha recibió la primera dosis de la vacuna?', 'texto', NULL, NULL, 'DD/MM/AAAA', NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, 'v1_2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_3', 'V', 'P', 'V1_3', 1417, '¿En qué fecha recibió la segunda dosis de la vacuna?', 'texto', NULL, NULL, 'DD/MM/AAAA', NULL, NULL, NULL, true, 'ocultar', NULL, NULL, NULL, 'v1_3', NULL, 'v1_1=2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_4', 'V', 'P', 'V1_4', 1420, '¿Qué vacuna recibió?', 'opciones', NULL, NULL, NULL, NULL, NULL, NULL, true, 'si_leer', NULL, NULL, NULL, 'v1_4', NULL, 'v1=1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_4_OTRA', 'V', 'P', 'V1_4_OTRA', 1423, '¿Cuál?', 'texto', NULL, NULL, NULL, NULL, NULL, NULL, true, 'no_leer ocultar', '-', NULL, NULL, 'v1_4_otra', NULL, 'v1_4=4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_5', 'V', 'P', 'V1_5', 1425, '¿Dónde recibió la vacuna?', 'opciones', NULL, NULL, NULL, 'E1', NULL, NULL, true, 'si_leer', NULL, NULL, NULL, 'v1_5', NULL, 'v1=1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_1/1', 'V1_1', 'O', '1', 1, 'Una dosis', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_1/2', 'V1_1', 'O', '2', 2, 'Dos dosis', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_4/1', 'V1_4', 'O', '1', 1, 'Sputnik V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_4/2', 'V1_4', 'O', '2', 2, 'Sinopharm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_4/3', 'V1_4', 'O', '3', 3, 'AstraZeneca', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_4/4', 'V1_4', 'O', '4', 4, 'Otra', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_5/1', 'V1_5', 'O', '1', 1, 'En esta Ciudad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_5/2', 'V1_5', 'O', '2', 2, 'En Provincia de Buenos Aires', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_5/3', 'V1_5', 'O', '3', 3, 'En otra provincia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V1_5/4', 'V1_5', 'O', '4', 4, 'En otro país', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
