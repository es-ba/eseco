set role to eseco201_produc_owner;
-- set role to eseco201_muleto_owner;
set search_path = "encu";
set client_encoding = 'UTF8';

update unidad_analisis
 set pk_agregada='enc'
 where unidad_analisis='viviendas';

drop table if exists personas;
drop table if exists viviendas;

create table "viviendas" (
  "operativo" text, 
  "enc" text, 
  "g1" text, 
  "g2" text, 
  "g3" text, 
  "g4" text, 
  "g5" text, 
  "ug2" text, 
  "ug3" text, 
  "ug4" text, 
  "ug5" text, 
  "ug6" text, 
  "ug7" text, 
  "g9" text, 
  "dv1" text, 
  "dv2" text, 
  "dv3" text, 
  "dv3otros" text, 
  "dv4" text, 
  "dv5" text, 
  "cp" text, 
  "p9" text, 
  "p11" text, 
  "p12" text, 
  "s1" text, 
  "s2" text, 
  "s3" text, 
  "d1" text, 
  "d2" text, 
  "d3" text, 
  "d4" text, 
  "d5" text, 
  "d5c" text, 
  "d6_1" text, 
  "d6_2" text, 
  "d6_3" text, 
  "d6_4" text, 
  "d6_5" text, 
  "d6_6" text, 
  "d6_7" text, 
  "d6_8" text, 
  "d6_9" text, 
  "d12" text, 
  "a1_1" text, 
  "a1_2" text, 
  "a1_3" text, 
  "a1_4" text, 
  "a1_5" text, 
  "a2" text, 
  "a3" text, 
  "a4" text, 
  "a5" text, 
  "cv1" text, 
  "cv2_1" text, 
  "cv2_2" text, 
  "cv2_3" text, 
  "cv2_4" text, 
  "cv2_5" text, 
  "cv2_6" text, 
  "cv3" text, 
  "cv4_1" text, 
  "cv4_2" text, 
  "cv4_3" text, 
  "cv4_4" text, 
  "cv4_5" text, 
  "cv4_6" text, 
  "t1" text, 
  "t2_1" text, 
  "t2_2" text, 
  "t2_3" text, 
  "t2_4" text, 
  "t2_5" text, 
  "t2_6" text, 
  "t2_7" text, 
  "t2_8" text, 
  "t3" text, 
  "e1" text, 
  "e2" text, 
  "e3" text, 
  "e4" text, 
  "e5" text, 
  "e6" text, 
  "e7" text, 
  "c1" text, 
  "c2" text, 
  "c3" text, 
  "c4" text, 
  "c5" text, 
  "c5ok" text, 
  "observaciones_viv" text,
  "personas" jsonb, 
  "_edad_maxima" text, 
  "_edad_minima" text, 
  "_personas_incompletas" text
, primary key ("operativo", "enc")
);
grant select, insert, update, delete, references on "viviendas" to eseco201_produc_admin;
grant all on "viviendas" to eseco201_produc_owner;


create table "personas" (
  "operativo" text, 
  "enc" text, 
  "persona" integer, 
  "p1" text, 
  "p2" text, 
  "p3" text, 
  "p4" text
, primary key ("operativo", "enc", "persona")
);
grant select, references on "personas" to eseco201_produc_admin;
grant all on "personas" to eseco201_produc_owner;

-- conss

-- FKs
alter table "viviendas" add constraint "viviendas tem REL" foreign key ("operativo", "enc") references "tem" ("operativo", "enc")  on update cascade;
alter table "personas" add constraint "personas viviendas REL" foreign key ("operativo", "enc") references "viviendas" ("operativo", "enc")  on update cascade;

-- index
create index "operativo,enc 4 viviendas IDX" ON "viviendas" ("operativo", "enc");
create index "operativo,enc 4 personas IDX" ON "personas" ("operativo", "enc");

do $SQL_ENANCE$
 begin
PERFORM enance_table('viviendas','operativo,enc');
PERFORM enance_table('personas','operativo,enc,persona');
end
$SQL_ENANCE$;

--datos
select sql2tabla_datos('encu', 'tem', 'ESECO');
select sql2tabla_datos('encu', 'viviendas', 'ESECO');
select sql2tabla_datos('encu', 'personas' , 'ESECO');
insert into variables_opciones (operativo, tabla_datos, variable, opcion, nombre, orden)
select vv.operativo, vv.tabla_datos, vv.variable, o.casillero::integer, o.nombre, o.orden
    from casilleros o join casilleros v on o.padre=(case when v.tipoc='OM' then v.padre||'/'||v.casillero else v.casillero end) and v.var_name is not null and o.tipoc='O'
     join variables vv on vv.operativo=v.operativo and v.var_name= variable -- tabla_datos ??? es lo que quiero determinar
    order by vv.operativo, vv.tabla_datos, vv.variable, o.orden;

update variables v
set nombre = c.nombre
from casilleros c
where v.variable=c.var_name and v.clase = 'interna';


-- para ts on the fly
drop table if exists viv_fields_json ;
select * into viv_fields_json
  from viviendas
  where false;
alter table viv_fields_json rename column observaciones_viv to fin;

