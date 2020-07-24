set search_path=encu;
--set role eseco_owner;
set role to eseco201_muleto_owner;
set role to eseco201_produc_owner;

alter table tem add column frel date;

--tipo_domicilio
alter table tem add column tipo_domicilio integer;

DROP TRIGGER IF EXISTS tem_area_sincro_trg ON tem ;

alter table tem disable trigger sincronizacion_tem_trg;
alter table tem disable trigger changes_trg;
alter table tem disable trigger tem_estados_trg;

update tem
  set tipo_domicilio=3
  where area >=900; --todavia no estan cargadas???

--tipo_domicilio=2
with ar as(
select area, max(enc) as ultimo 						  
  from tem 
  group by 1)
, nuevas_2 as (
  select area*100 + 30 + n enc, area, 3 reserva, 2 as tipo_domicilio, '{"personas":[],"g1":2}'::jsonb json_encuesta, 3 dominio 
    from ar ,generate_series(1, 6) n
    where area<=700
    order by 1
)
insert into tem(enc, area, reserva, tipo_domicilio, json_encuesta,dominio)
  select enc, area,reserva,tipo_domicilio,json_encuesta,dominio
    from nuevas_2;

alter table tem enable trigger sincronizacion_tem_trg;
alter table tem enable trigger changes_trg;
alter table tem enable trigger tem_estados_trg;

insert into "casilleros" ("operativo", "id_casillero", "padre", "tipoc", "casillero", "orden", "nombre", "tipovar", "longitud", "tipoe", "aclaracion", "salto", "unidad_analisis", "cantidad_resumen", "irrepetible", "despliegue", "ver_id", "optativo", "formulario_principal", "var_name", "var_name_especial", "expresion_habilitar", "valor_ns_nc", "valor_sin_dato") values
('ESECO', 'UG', 'F:F1', 'B', 'UG', '50', 'Ubicación geográfica', null, null, null, null, null, null, null, 'true', null, null, null, null, null, null, null, null, null),
('ESECO', 'G1', 'UG', 'P', 'G1', '1', 'Tipo de domicilio', 'numero', null, null, null, null, null, null, 'true', 'calculada', null, null, null, 'g1', null, null, null, null),
('ESECO', 'G2', 'UG', 'P', 'G2', '100', 'Calle', 'texto', null, null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'g2', null, 'g1=2', null, null),
('ESECO', 'G3', 'UG', 'P', 'G3', '110', 'Número', 'texto', '4', null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'g3', null, 'g1=2', null, null),
('ESECO', 'G4', 'UG', 'P', 'G4', '120', 'Piso', 'texto', '2', null, null, null, null, null, 'true', 'ocultar no_leer', null, 'true', null, 'g4', null, 'g1=2', null, null),
('ESECO', 'G5', 'UG', 'P', 'G5', '130', 'Departamento', 'texto', '2', null, null, null, null, null, 'true', 'ocultar no_leer', null, 'true', null, 'g5', null, 'g1=2', null, null),
('ESECO', 'UG2', 'UG', 'P', 'UG2', '200', 'Barrio', 'texto', 'medio', null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'ug2', null, 'g1=3', null, null),
('ESECO', 'UG3', 'UG', 'P', 'UG3', '210', 'Comuna', 'numero', '2', null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'ug3', null, 'g1=3', null, null),
('ESECO', 'UG4', 'UG', 'P', 'UG4', '220', 'Fracción', 'numero', '3', null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'ug4', null, 'g1=3', null, null),
('ESECO', 'UG5', 'UG', 'P', 'UG5', '230', 'Radio', 'numero', '3', null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'ug5', null, 'g1=3', null, null),
('ESECO', 'UG6', 'UG', 'P', 'UG6', '250', 'Manzana', 'texto', '3', null, null, null, null, null, 'true', 'ocultar no_leer', null, null, null, 'ug6', null, 'g1=3', null, null),
('ESECO', 'UG7', 'UG', 'P', 'UG7', '260', 'Casa', 'texto', '3', null, null, null, null, null, 'true', 'ocultar no_leer', null, 'true', null, 'ug7', null, 'g1=3', null, null),
('ESECO', 'G9', 'UG', 'P', 'G9', '300', 'Otros datos domicilio', 'texto', null, null, null, null, null, null, 'true', 'ocultar no_leer', null, 'true', null, 'g9', null, 'g1=2 or g1=3', null, null);
