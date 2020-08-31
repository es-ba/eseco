set role to eseco201_produc_owner;
set search_path=encu;

alter table tareas_tem
    drop column if exists rea ,
    drop column if exists norea ,
    drop column if exists rea_m ,
    drop column if exists sexo_sel ,
    drop column if exists edad_sel ,
    drop column if exists fecha_rel ,
    drop column if exists tipos_inconsist ,
    drop column if exists cant_p , 
    drop column if exists seleccionado;
alter table tareas_tem
    drop column if exists json_encuesta ,
    drop column if exists json_backup ,
    drop column if exists resumen_estado ,
    drop column if exists etiqueta ;

    
alter table tem
  rename column frel to fecha_rel,
  add column if not exists tipos_inconsist text;

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
   drop column seleccion_actual,
   drop column seleccion_anterior,
--   drop column relevador, 

--   drop column carga,     -- se usara fecha_asignacion 
   --pasan a tareas_tem
   --     drop column habilitada, 
   ;

    --add column rea_p bigint, ??
    --add column norea_p text,  ??
    --add column cant_p bigint,  ??
    --add column frel date,  ??
    --drop column cluster???
    --drop column enc_original???

--agregar cargado al from de tareas_areas
alter table tareas_areas
    add column cargadas integer,
    add column obs_asignante text,
    add column verificado_asignante text;

alter table areas
    drop column recepcionista ,
    drop column relevador ,
    drop column operacion_area ,
    drop column fecha ,
--    drop column cargadas ,
    drop column obs_recepcionista ,
    drop column verificado_rec;

insert into tareas_areas

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

