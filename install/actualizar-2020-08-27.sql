set role to eseco201_produc_owner;
set search_path=encu;

select *  into tem_bkp 
  from tem;

alter table tareas_tem
    add column carga_observaciones text,
    add column cargado_dm text,
    add column habilitada boolean,
    add column json_encuesta jsonb,
    add column resumen_estado text,
    add column rea bigint,
    add column norea text,
    add column rea_m integer,
    add column sexo_sel text,
    add column edad_sel bigint,
    add column json_backup jsonb,    
    add column etiqueta text,
    add column fecha_rel date,
    add column tipos_inconsist text,
    add column cant_p bigint, 
    add column seleccionado bigint
    add column cargado boolean;


ALTER TABLE tareas_tem DROP CONSTRAINT "accion<>''";
ALTER TABLE tareas_tem DROP CONSTRAINT "persona<>''";
ALTER TABLE encu.tareas_tem DROP CONSTRAINT "tareas_tem usuarios REL";

alter table "tareas_tem" add constraint "asignado<>''" check ("asignado"<>'');
alter table "tareas_tem" add constraint "asignante<>''" check ("asignante"<>'');
alter table "tareas_tem" add constraint "operacion<>''" check ("operacion"<>'');
alter table "tareas_tem" add constraint "notas<>''" check ("notas"<>'');
alter table "tareas_tem" add constraint "carga_observaciones<>''" check ("carga_observaciones"<>'');
alter table "tareas_tem" add constraint "resumen_estado<>''" check ("resumen_estado"<>'');
alter table "tareas_tem" add constraint "etiqueta<>''" check ("etiqueta"<>'');
alter table "tareas_tem" add constraint "tipos_inconsist<>''" check ("tipos_inconsist"<>'');

alter table "tareas_tem" add constraint "tareas_tem at REL" foreign key ("asignante") references "usuarios" ("idper")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem ad REL" foreign key ("asignado") references "usuarios" ("idper")  on update cascade;
DROP INDEX "persona 4 tareas_tem IDX";
create index "asignante 4 tareas_tem IDX" ON "tareas_tem" ("asignante");
create index "asignado 4 tareas_tem IDX" ON "tareas_tem" ("asignado");

insert into tareas_tem(tarea, operativo, enc)
  select 'rel' tarea, operativo ,enc
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
    new.etiqueta     = datos ->>'c5';
    new.fecha_rel    = (datos ->>'c5f')::date;
    new.cargado      = new.cargado_dm is not null;
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

CREATE TRIGGER sincronizacion_tareas_tem_trg
    BEFORE INSERT OR UPDATE OF json_encuesta, carga_observaciones
    ON encu.tareas_tem
    FOR EACH ROW
    EXECUTE PROCEDURE encu.sincronizacion_tareas_tem_trg();

update tareas_tem tt
  set (operacion,carga_observaciones,cargado_dm, habilitada, json_encuesta, resumen_estado, rea
    ,norea,rea_m, sexo_sel, edad_sel, json_backup, etiqueta, fecha_asignacion, asignado)=
    (t.operacion,t.carga_observaciones,t.cargado_dm,t.habilitada,t.json_encuesta,t.resumen_estado,t.rea
    ,t.norea,t.rea_m,t.sexo_sel,t.edad_sel,t.json_backup, t.etiqueta, t.carga, t.relevador)
    from tem t 
    where t.operativo=tt.operativo and t.enc= tt.enc;

alter table tareas_areas
  drop column accion;
-- DROP TRIGGER sincronizacion_tem_trg ON encu.tem;
--DROP FUNCTION encu.sincronizacion_tem_trg();
/*
alter table tem
   drop column confirmada,          
   drop column seleccion_actual,
   drop column seleccion_anterior,
   drop column relevador, -- se usara asignado

   drop column carga,     -- se usara fecha_asignacion 
   --pasan a tareas_tem
        drop column operacion,           
        drop column carga_observacion,    
        drop column habilitada, 
        drop column json_encuesta,
        drop column resumen_estado,
        drop column rea,
        drop column norea,
        drop column rea_p,
        drop column norea_p,
        drop column cant_p,
        drop column sexo_sel,
        drop column edad_sel,
        drop column rea_m,
        drop column frel,
        drop column json_backup
   ;

    --add column rea_p bigint, ??
    --add column norea_p text,  ??
    --add column cant_p bigint,  ??
    --add column frel date,  ??
    --drop column cluster???
    --drop column enc_original???

--agregar cargado al from de tareas_areas
alter table tareas_areas
    rename column accion to operacion,
    add column cargadas integer,
    add column reas integer,
    add column no_reas integer,
    add column incompletas integer,
    add column vacias integer,
    add column inhabilitadas integer,
    add column obs_asignante text,
    add column cargadas_bkp integer,
    add column reas_bkp integer,
    add column no_reas_bkp integer,
    add column incompletas_bkp integer,
    add column vacias_bkp integer,
    add column inhabilitadas_bkp integer,
    add column verificado_asignante text;

alter table areas
    drop column recepcionista ,
    drop column relevador ,
    drop column operacion_area ,
    drop column fecha ,
    drop column cargadas ,
    drop column reas ,
    drop column no_reas ,
    drop column incompletas ,
    drop column vacias ,
    drop column inhabilitadas ,
    drop column obs_recepcionista ,
    drop column cargadas_bkp ,
    drop column reas_bkp ,
    drop column no_reas_bkp ,
    drop column incompletas_bkp ,
    drop column vacias_bkp ,
    drop column inhabilitadas_bkp ,
    drop column verificado_rec;


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

