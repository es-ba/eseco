set role to eseco211_produc_owner;
-- set role to eseco211_muleto_owner;
set search_path = "encu";
set client_encoding = 'UTF8';

update unidad_analisis
 set pk_agregada='enc'
 where unidad_analisis='viviendas';

drop table if exists personas;
drop table if exists viviendas;
DROP TABLE if exists encu.viv_fields_json;

create table "viviendas" (
  "operativo" text, 
  "enc" text, 
  "tipo_seleccion" bigint, 
  "g1" bigint, 
  "g2" text, 
  "g3" text, 
  "g4" text, 
  "g5" text, 
  "ug2" text, 
  "ug3" bigint, 
  "ug4" bigint, 
  "ug5" bigint, 
  "ug6" text, 
  "ug7" text, 
  "g9" text, 
  "dv1" bigint, 
  "dv2" date, 
  "dv3" bigint, 
  "dv3otros" text, 
  "dv4" bigint, 
  "dv5" bigint, 
  "tipo_relevamiento" bigint, 
  "cp" bigint, 
  "p5" bigint, 
  "p6" bigint, 
  "p9" bigint, 
  "p11" bigint, 
  "p12" text, 
  "sp1" bigint, 
  "sp2" text, 
  "sp3" text, 
  "sp4" text, 
  "sp5" text, 
  "sp6" bigint, 
  "s1" bigint, 
  "s2" bigint, 
  "s3" bigint, 
  "d1" bigint, 
  "d2" bigint, 
  "d3" bigint, 
  "d4" bigint, 
  "d5" bigint, 
  "d6_1" bigint, 
  "d6_2" bigint, 
  "d6_3" bigint, 
  "d6_4" bigint, 
  "d6_5" bigint, 
  "d6_6" bigint, 
  "d6_7" bigint, 
  "d6_8" bigint, 
  "d6_9" bigint, 
  "d12" bigint, 
  "a1_1" bigint, 
  "a1_2" bigint, 
  "a1_3" bigint, 
  "a1_4" bigint, 
  "a1_5" bigint, 
  "a2" bigint, 
  "a3" bigint, 
  "a4" bigint, 
  "a5" bigint, 
  "cv1" bigint, 
  "cv2_1" bigint, 
  "cv2_2" bigint, 
  "cv2_3" bigint, 
  "cv2_4" bigint, 
  "cv2_5" bigint, 
  "cv2_6" bigint, 
  "cv3" bigint, 
  "cv4_1" bigint, 
  "cv4_2" bigint, 
  "cv4_3" bigint, 
  "cv4_4" bigint, 
  "cv4_5" bigint, 
  "cv4_6" bigint, 
  "t1" bigint, 
  "t2_1" bigint, 
  "t2_2" bigint, 
  "t2_3" bigint, 
  "t2_4" bigint, 
  "t2_5" bigint, 
  "t2_6" bigint, 
  "t2_7" bigint, 
  "t2_8" bigint, 
  "t3" bigint, 
  "v1" bigint, 
  "v2" bigint, 
  "v3" bigint, 
  "v4_1" bigint, 
  "v4_2" bigint, 
  "v4_3" bigint, 
  "v4_4" bigint, 
  "v4_5" bigint, 
  "v4_6" bigint, 
  "v4_6_otro" text, 
  "e1" text, 
  "e2" text, 
  "e3" bigint, 
  "e4" text, 
  "e5" bigint, 
  "e6" text, 
  "e7" text, 
  "c1" text, 
  "c2" text, 
  "c3" text, 
  "c4" text, 
  "c5" text, 
  "c5ok" bigint, 
  "c6" text, 
  "observaciones_viv" text
, primary key ("operativo", "enc")
);
grant select, references on "viviendas" to eseco211_produc_admin;

create table "personas" (
  "operativo" text, 
  "enc" text, 
  "persona" integer, 
  "p1" text, 
  "p2" bigint, 
  "p3" bigint, 
  "p4" bigint
, primary key ("operativo", "enc", "persona")
);
grant select, references on "personas" to eseco211_produc_admin;

-- conss
alter table "viviendas" add constraint "operativo<>''" check ("operativo"<>'');
alter table "viviendas" alter column "operativo" set not null;
alter table "viviendas" add constraint "enc<>''" check ("enc"<>'');
alter table "viviendas" alter column "enc" set not null;
alter table "viviendas" add constraint "g2<>''" check ("g2"<>'');
alter table "viviendas" add constraint "g3<>''" check ("g3"<>'');
alter table "viviendas" add constraint "g4<>''" check ("g4"<>'');
alter table "viviendas" add constraint "g5<>''" check ("g5"<>'');
alter table "viviendas" add constraint "ug2<>''" check ("ug2"<>'');
alter table "viviendas" add constraint "ug6<>''" check ("ug6"<>'');
alter table "viviendas" add constraint "ug7<>''" check ("ug7"<>'');
alter table "viviendas" add constraint "g9<>''" check ("g9"<>'');
alter table "viviendas" add constraint "dv3otros<>''" check ("dv3otros"<>'');
alter table "viviendas" add constraint "p12<>''" check ("p12"<>'');
alter table "viviendas" add constraint "sp2<>''" check ("sp2"<>'');
alter table "viviendas" add constraint "sp3<>''" check ("sp3"<>'');
alter table "viviendas" add constraint "sp4<>''" check ("sp4"<>'');
alter table "viviendas" add constraint "sp5<>''" check ("sp5"<>'');
alter table "viviendas" add constraint "e1<>''" check ("e1"<>'');
alter table "viviendas" add constraint "e2<>''" check ("e2"<>'');
alter table "viviendas" add constraint "e4<>''" check ("e4"<>'');
alter table "viviendas" add constraint "e6<>''" check ("e6"<>'');
alter table "viviendas" add constraint "e7<>''" check ("e7"<>'');
alter table "viviendas" add constraint "c1<>''" check ("c1"<>'');
alter table "viviendas" add constraint "c2<>''" check ("c2"<>'');
alter table "viviendas" add constraint "c3<>''" check ("c3"<>'');
alter table "viviendas" add constraint "c4<>''" check ("c4"<>'');
alter table "viviendas" add constraint "c5<>''" check ("c5"<>'');
alter table "viviendas" add constraint "c6<>''" check ("c6"<>'');
alter table "viviendas" add constraint "v4_6_otro<>''" check ("v4_6_otro"<>'');
alter table "viviendas" add constraint "observaciones_viv<>''" check ("observaciones_viv"<>'');
alter table "personas" add constraint "operativo<>''" check ("operativo"<>'');
alter table "personas" alter column "operativo" set not null;
alter table "personas" add constraint "enc<>''" check ("enc"<>'');
alter table "personas" alter column "enc" set not null;
alter table "personas" alter column "persona" set not null;
alter table "personas" add constraint "p1<>''" check ("p1"<>'');

-- FKs
alter table "viviendas" add constraint "viviendas tem REL" foreign key ("operativo", "enc") references "tem" ("operativo", "enc")  on update cascade;
alter table "personas" add constraint "personas viviendas REL" foreign key ("operativo", "enc") references "viviendas" ("operativo", "enc")  on update cascade;

-- index
create index "operativo,enc 4 viviendas IDX" ON "viviendas" ("operativo", "enc");
create index "operativo,enc 4 personas IDX" ON "personas" ("operativo", "enc");

--do $SQL_ENANCE$
-- begin
--PERFORM enance_table('viviendas','operativo,enc');
--PERFORM enance_table('personas','operativo,enc,persona');
--end
--$SQL_ENANCE$;

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
