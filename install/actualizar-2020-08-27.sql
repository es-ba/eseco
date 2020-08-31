set role to eseco201_produc_owner;
set search_path=encu;

select *  into tem_bkp 
  from tem;

delete from tareas_tem;
alter table tareas_tem
	add column area integer not null ,
    add column carga_observaciones text,
    add column cargado_dm text,
    add column habilitada boolean,
    add column rea bigint,
    add column norea text,
    add column rea_m integer,
    add column sexo_sel bigint,
    add column edad_sel bigint,
    add column fecha_rel date,
    add column tipos_inconsist text,
    add column cant_p bigint, 
    add column seleccionado bigint,
    add column cargado boolean;


ALTER TABLE tareas_tem DROP CONSTRAINT "accion<>''";
ALTER TABLE tareas_tem DROP CONSTRAINT "persona<>''";
ALTER TABLE encu.tareas_tem DROP CONSTRAINT "tareas_tem usuarios REL";

alter table "tareas_tem" add constraint "asignado<>''" check ("asignado"<>'');
alter table "tareas_tem" add constraint "asignante<>''" check ("asignante"<>'');
alter table "tareas_tem" add constraint "operacion<>''" check ("operacion"<>'');
alter table "tareas_tem" add constraint "notas<>''" check ("notas"<>'');
alter table "tareas_tem" add constraint "carga_observaciones<>''" check ("carga_observaciones"<>'');
--alter table "tareas_tem" add constraint "resumen_estado<>''" check ("resumen_estado"<>'');
--alter table "tareas_tem" add constraint "etiqueta<>''" check ("etiqueta"<>'');
alter table "tareas_tem" add constraint "tipos_inconsist<>''" check ("tipos_inconsist"<>'');

alter table "tareas_tem" add constraint "tareas_tem at REL" foreign key ("asignante") references "usuarios" ("idper")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem areas REL" foreign key ("area") references "areas" ("area")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem ad REL" foreign key ("asignado") references "usuarios" ("idper")  on update cascade;
DROP INDEX "persona 4 tareas_tem IDX";
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
declare
  datos         jsonb=new.json_encuesta;
begin
    new.cargado      = new.cargado_dm is not null;
    return new;
end;
$BODY$;
ALTER FUNCTION encu.sincronizacion_tareas_tem_trg()
    OWNER TO eseco201_produc_owner;

DROP TRIGGER sincronizacion_tareas_tem_trg ON encu.tareas_tem;
CREATE TRIGGER sincronizacion_tareas_tem_trg
    BEFORE INSERT OR UPDATE OF cargado_dm
    ON encu.tareas_tem
    FOR EACH ROW
    EXECUTE PROCEDURE encu.sincronizacion_tareas_tem_trg();

update tareas_tem tt
  set (operacion,carga_observaciones,cargado_dm, habilitada, rea
    ,norea,rea_m, sexo_sel, edad_sel, fecha_asignacion, asignado)=
    (t.operacion,t.carga_observaciones,t.cargado_dm,t.habilitada,t.rea
    ,t.norea,t.rea_m,t.sexo_sel::bigint,t.edad_sel, t.carga, t.relevador)
    from tem t 
    where t.operativo=tt.operativo and t.enc= tt.enc;

alter table tareas_areas
  drop if exists column accion;
  
alter table tareas_tem alter column sexo_sel type bigint USING sexo_sel::bigint;
