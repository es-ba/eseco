set role to eseco201_produc_owner;
set search_path=encu;

create table "resultados_test" (
  "resultado" text, 
  "email_asunto" text, 
  "email_texto" text, 
  "pagina_texto" text
, primary key ("resultado")
);
grant select, insert, update on "resultados_test" to eseco201_produc_admin;
grant all on "resultados_test" to eseco201_produc_owner;

alter table "resultados_test" add constraint "resultado<>''" check ("resultado"<>'');
alter table "resultados_test" alter column "resultado" set not null;
alter table "resultados_test" add constraint "email_asunto<>''" check ("email_asunto"<>'');
alter table "resultados_test" add constraint "email_texto<>''" check ("email_texto"<>'');
alter table "resultados_test" add constraint "pagina_texto<>''" check ("pagina_texto"<>'');

insert into "resultados_test" ("resultado","email_asunto","email_texto","pagina_texto") 
	values('Positivo', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto positivo #nombre #apellido #resultado' , 'texto pagina positivo #nombre #apellido #resultado'),
	('Negativo', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto negativo #nombre #apellido #resultado' , 'texto pagina negativo #nombre #apellido #resultado'),
	('Indeterminado', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto indeterminado #nombre #apellido #resultado' , 'texto pagina indeterminado'),
	('Escasa muestra', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto escasa muestra #nombre #apellido #resultado' , 'texto pagina escasa muestra#nombre #apellido #resultado');

update etiquetas set resultado='Negativo' where resultado='negativo';
update etiquetas set resultado='Positivo' where resultado='positivo';


alter table "etiquetas" add constraint "etiquetas resultados_test REL" foreign key ("resultado") references "resultados_test" ("resultado")  on update cascade;

create table "tareas" (
  "tarea" text, 
  "nombre" text
, primary key ("tarea")
);
grant select, insert, update, delete on "tareas" to eseco201_produc_admin;
grant all on "tareas" to eseco201_produc_owner;

create table "tareas_tem" (
  "tarea" text, 
  "operativo" text, 
  "enc" text, 
  "persona" text, 
  "accion" text, 
  "fecha_asignacion" date, 
  "resultado" text, 
  "fecha_resultado" date, 
  "notas" text
, primary key ("tarea", "operativo", "enc")
);
grant select, insert, update, delete on "tareas_tem" to eseco201_produc_admin;
grant all on "tareas_tem" to eseco201_produc_owner;

create table "tareas_areas" (
  "tarea" text, 
  "area" integer
, primary key ("tarea", "area")
);
grant select, insert, update, delete on "tareas_areas" to eseco201_produc_admin;
grant all on "tareas_areas" to eseco201_produc_owner;

create table "resultados_tarea" (
  "resultado" text, 
  "descripcion" text
, primary key ("resultado")
);
grant select, insert, update, delete on "resultados_tarea" to eseco201_produc_admin;
grant all on "resultados_tarea" to eseco201_produc_owner;

alter table "tareas" add constraint "tarea<>''" check ("tarea"<>'');
alter table "tareas" add constraint "nombre<>''" check ("nombre"<>'');

alter table "tareas_tem" add constraint "tarea<>''" check ("tarea"<>'');
alter table "tareas_tem" add constraint "operativo<>''" check ("operativo"<>'');
alter table "tareas_tem" add constraint "enc<>''" check ("enc"<>'');
alter table "tareas_tem" add constraint "persona<>''" check ("persona"<>'');
alter table "tareas_tem" add constraint "accion<>''" check ("accion"<>'');
alter table "tareas_tem" add constraint "resultado<>''" check ("resultado"<>'');

alter table "tareas_tem" add constraint "tareas_tem tem REL" foreign key ("operativo", "enc") references "tem" ("operativo", "enc")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem tareas REL" foreign key ("tarea") references "tareas" ("tarea")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem usuarios REL" foreign key ("persona") references "usuarios" ("idper")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem resultados_tarea REL" foreign key ("resultado") references "resultados_tarea" ("resultado")  on update cascade;

create index "operativo,enc 4 tareas_tem IDX" ON "tareas_tem" ("operativo", "enc");
create index "tarea 4 tareas_tem IDX" ON "tareas_tem" ("tarea");
create index "persona 4 tareas_tem IDX" ON "tareas_tem" ("persona");
create index "resultado 4 tareas_tem IDX" ON "tareas_tem" ("resultado");

alter table "tareas_areas" add constraint "tarea<>''" check ("tarea"<>'');

alter table "tareas_areas" add constraint "tareas_areas tareas REL" foreign key ("tarea") references "tareas" ("tarea")  on update cascade;
alter table "tareas_areas" add constraint "tareas_areas areas REL" foreign key ("area") references "areas" ("area")  on update cascade;

create index "tarea 4 tareas_areas IDX" ON "tareas_areas" ("tarea");
create index "area 4 tareas_areas IDX" ON "tareas_areas" ("area");

alter table "resultados_tarea" add constraint "resultado<>''" check ("resultado"<>'');
alter table "resultados_tarea" add constraint "descripcion<>''" check ("descripcion"<>'');

insert into tareas (tarea, nombre) values('rel','relevamiento'), ('sup','supervisión'), ('sen','sensibilización');

do $SQL_ENANCE$
 begin
PERFORM enance_table('tareas','tarea');
PERFORM enance_table('tareas_tem','tarea,operativo,enc');
PERFORM enance_table('tareas_areas','tarea,area');
PERFORM enance_table('resultados_tarea','resultado');
 end
$SQL_ENANCE$;

alter table tareas_areas add column asignado text;
alter table tareas_areas add column operacion text;
alter table tareas_areas add column fecha_asignacion date;
alter table tareas_areas add column asignante text;

alter table tareas_tem add column asignado text;
alter table tareas_tem add column operacion text;
alter table tareas_tem add column asignante text;


select *  into tem_bkp 
  from tem;

delete from tareas_tem;
alter table tareas_tem
	add column area integer not null ,
    add column carga_observaciones text,
    add column cargado_dm text,
    add column habilitada boolean,
    add column cargado boolean;
	
   
alter table tem rename column frel to fecha_rel;
alter table tem  add column if not exists tipos_inconsist text;
  
alter table tareas_tem drop column persona;

alter table "tareas_tem" add constraint "asignado<>''" check ("asignado"<>'');
alter table "tareas_tem" add constraint "asignante<>''" check ("asignante"<>'');
alter table "tareas_tem" add constraint "operacion<>''" check ("operacion"<>'');
alter table "tareas_tem" add constraint "notas<>''" check ("notas"<>'');
alter table "tareas_tem" add constraint "carga_observaciones<>''" check ("carga_observaciones"<>'');
alter table "tareas_tem" add constraint "tareas_tem at REL" foreign key ("asignante") references "usuarios" ("idper")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem areas REL" foreign key ("area") references "areas" ("area")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem ad REL" foreign key ("asignado") references "usuarios" ("idper")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem operaciones REL" foreign key ("operacion") references "operaciones" ("operacion")  on update cascade;

create index "asignante 4 tareas_tem IDX" ON "tareas_tem" ("asignante");
create index "asignado 4 tareas_tem IDX" ON "tareas_tem" ("asignado");
create index "areas 4 tareas_tem IDX" ON "tareas_tem" ("area");

insert into tareas_tem(tarea, operativo, enc, area)
  select 'rel' tarea, operativo ,enc, area
  from tem where json_encuesta->>'dv1' is not null;

DROP TRIGGER tem_cod_per_trg ON encu.tem;
DROP FUNCTION encu.tem_cod_per_trg();
DROP TRIGGER tem_estados_trg ON encu.tem;
DROP FUNCTION encu.tem_estados_trg();    

CREATE OR REPLACE FUNCTION encu.sincronizacion_tareas_tem_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
begin
    new.cargado      = new.cargado_dm is not null;
    return new;
end;
$BODY$;
ALTER FUNCTION encu.sincronizacion_tareas_tem_trg()
    OWNER TO eseco201_produc_owner;

CREATE TRIGGER sincronizacion_tareas_tem_trg
    BEFORE INSERT OR UPDATE OF cargado_dm
    ON encu.tareas_tem
    FOR EACH ROW
    EXECUTE PROCEDURE encu.sincronizacion_tareas_tem_trg();

update tareas_tem tt
  set (operacion,carga_observaciones,cargado_dm, habilitada, fecha_asignacion, asignado)=
    (t.operacion,t.carga_observaciones,t.cargado_dm,t.habilitada, t.carga, t.relevador)
    from tem t 
    where t.operativo=tt.operativo and t.enc= tt.enc;
	
alter table tem drop constraint "sexo_sel<>''";
alter table tem alter column sexo_sel type bigint USING sexo_sel::bigint;

--tareas areas
alter table "tareas_areas" add constraint "tareas_areas operaciones REL" foreign key ("operacion") references "operaciones" ("operacion")  on update cascade;
alter table "tareas_areas" add constraint "asignado<>''" check ("asignado"<>'');
alter table "tareas_areas" add constraint "asignante<>''" check ("asignante"<>'');
alter table "tareas_areas" add constraint "operacion<>''" check ("operacion"<>'');

alter table tem add column seleccionado bigint;

CREATE OR REPLACE FUNCTION encu.sincronizacion_tem_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
declare
  datos         jsonb=new.json_encuesta;
begin
    new.fecha_rel    = (datos ->>'c5f')::date;
    new.rea          = CASE (datos ->>'dv1')::integer when 1 then 1 when 2 then 0 else null end;
    new.norea        = (datos ->>'dv3')::integer ;
    new.cant_p       = (datos ->>'cp') ::integer ;
    new.rea_m        = case when (datos->>'c5ok')::integer=1 and (datos ->>'dv1')::integer=1 then 1 else null end;
    new.sexo_sel     = ((datos->'personas'->((datos->>'p11')::integer - 1))->>'p2')::bigint ;
    new.edad_sel     = ((datos->'personas'->((datos->>'p11')::integer - 1))->>'p3')::bigint ;
    new.seleccionado = (datos ->>'p11') ::integer;
    new.tipos_inconsist= encu.validar_tipodato(new.enc,datos);
    return new;
end;
$BODY$;
ALTER FUNCTION encu.sincronizacion_tareas_tem_trg()
    OWNER TO eseco201_produc_owner;
	
update tem set obs=obs||' ff'
  where json_encuesta->>'dv1' is not null;
	
	
alter table tem
   drop column confirmada,          
--   drop column relevador, 

   drop column carga;     -- se usara fecha_asignacion 
   --pasan a tareas_tem
   --     drop column habilitada, 
   --;

--agregar cargado al from de tareas_areas
alter table tareas_areas
    add column cargadas integer,
    add column obs_asignante text;
	
-- no se usaron , estaban en otros proyectos
alter table tem
   drop column lote,
   drop column carga_rol,
   drop column carga_persona,
   drop column dispositivo,
   drop column estado,
   drop column cod_enc,
   drop column cod_recu,
   drop column cod_sup,
   drop column result_sup
   ;   


