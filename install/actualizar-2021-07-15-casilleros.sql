set search_path= encu;
SET role eseco211_muleto_owner;

delete from casilleros where id_casillero~'^P7/\d$' or id_casillero='P7';
delete from casilleros where id_casillero~'^DV6/\d$' or id_casillero='DV6';

delete from casilleros c  
  where id_casillero~'^V(1_\d|5|6|7|8|9)/\d$' ;
delete from casilleros c  
  where id_casillero~'^V(1_|5|6|7|8|9)' and tipoc in('P','FILTRO') ;

--cambio en nombre de pregunta especifique V4
delete from casilleros where id_casillero in ('V4_6_OTRO','V4otros');
INSERT INTO encu.casilleros(operativo, id_casillero, padre, tipoc, casillero, orden, nombre, tipovar, longitud, tipoe, aclaracion, salto, unidad_analisis, cantidad_resumen, irrepetible, despliegue, ver_id, optativo, formulario_principal, var_name, var_name_especial, expresion_habilitar, valor_ns_nc, valor_sin_dato) VALUES 
  ('ESECO', 'V4otros', 'V', 'P', 'V4otros', 1450, 'Especifique', 'texto', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ocultar no_leer', NULL, NULL, NULL, 'v4otros', null, 'v4_6=1', NULL, NULL);


--pregunta sobre dengue
INSERT INTO casilleros (operativo, id_casillero, padre, tipoc, casillero, orden, nombre, tipovar, longitud, tipoe, aclaracion, salto, unidad_analisis, cantidad_resumen, irrepetible, despliegue, ver_id, optativo, formulario_principal, var_name, var_name_especial, expresion_habilitar, valor_ns_nc, valor_sin_dato, leer, calculada, libre, especial) VALUES
('ESECO','DV6','DV','P','DV6',125,'¿Alguna vez un médico o personal de salud le dijo que tenía dengue a Usted o a otra persona de esta vivienda?','si_no',NULL,NULL,NULL,NULL,NULL,NULL,True,NULL,NULL,NULL,NULL,'dv6',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('ESECO','DV6/1','DV6','O','1',1,'Sí',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('ESECO','DV6/2','DV6','O','2',2,'No',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);

--cambiar saltos de la V1
update casilleros set salto= null where operativo='ESECO' AND id_casillero='V1/1';
update casilleros set salto= 'V2' where operativo='ESECO' AND id_casillero='V1/2';
--correr los ordenes para generar lugar a las nuevas preguntas
update casilleros set orden= orden + 20 where operativo='ESECO' AND id_casillero ~'^V(2|3|4)$' and tipoc='P' AND orden <=1420;
--nuevos casilleros sobre vacunacion
INSERT INTO casilleros (operativo, id_casillero, padre, tipoc, casillero, orden, nombre, tipovar, longitud, tipoe, aclaracion, salto, unidad_analisis, cantidad_resumen, irrepetible, despliegue, ver_id, optativo, formulario_principal, var_name, var_name_especial, expresion_habilitar, valor_ns_nc, valor_sin_dato, leer, calculada, libre, especial) VALUES
  ('ESECO', 'V5', 'V', 'P', 'V5', 1408, '¿Cuántas dosis recibió?', 'opciones', NULL, NULL, NULL, NULL, NULL, NULL, true, 'si_leer', NULL, NULL, NULL, 'v5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V6', 'V', 'P', 'V6', 1412, '¿En qué fecha recibió la primera dosis de la vacuna?', 'texto', NULL, NULL, 'DD/MM/AAAA', NULL, NULL, NULL, true, NULL, NULL, NULL, NULL, 'v6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V7', 'V', 'P', 'V7', 1417, '¿En qué fecha recibió la segunda dosis de la vacuna?', 'texto', NULL, NULL, 'DD/MM/AAAA', NULL, NULL, NULL, true, 'ocultar', NULL, NULL, NULL, 'v7', NULL, 'v5=2', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V8', 'V', 'P', 'V8', 1420, '¿Qué vacuna recibió?', 'opciones', NULL, NULL, NULL, NULL, NULL, NULL, true, 'si_leer', NULL, NULL, NULL, 'v8', NULL, 'v1=1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V8otros', 'V', 'P', 'V8otros', 1423, '¿Cuál?', 'texto', NULL, NULL, NULL, NULL, NULL, NULL, true, 'no_leer ocultar', '-', NULL, NULL, 'v8otros', NULL, 'v8=4', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V9', 'V', 'P', 'V9', 1425, '¿Dónde recibió la vacuna?', 'opciones', NULL, NULL, NULL, 'E1', NULL, NULL, true, 'si_leer', NULL, NULL, NULL, 'v9', NULL, 'v1=1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V5/1', 'V5', 'O', '1', 1, 'Una dosis', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V5/2', 'V5', 'O', '2', 2, 'Dos dosis', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V8/1', 'V8', 'O', '1', 1, 'Sputnik V', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V8/2', 'V8', 'O', '2', 2, 'Sinopharm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V8/3', 'V8', 'O', '3', 3, 'AstraZeneca', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V8/4', 'V8', 'O', '4', 4, 'Otra', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V9/1', 'V9', 'O', '1', 1, 'En esta Ciudad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V9/2', 'V9', 'O', '2', 2, 'En Provincia de Buenos Aires', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V9/3', 'V9', 'O', '3', 3, 'En otra provincia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('ESECO', 'V9/4', 'V9', 'O', '4', 4, 'En otro país', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

--2021/07/20
--agregar salto a DV3 a la opcion 2 de DV1
update casilleros set salto= 'DV3' where operativo='ESECO' AND id_casillero='DV1/2';
