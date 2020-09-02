﻿--set role to eseco_owner;
--set search_path = encu;

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

-- /*
CREATE TRIGGER sincronizacion_tem_trg
  BEFORE INSERT OR UPDATE OF json_encuesta, obs
  ON tem
  FOR EACH ROW
  EXECUTE PROCEDURE sincronizacion_tem_trg();

-- */

--Ejemplos de uso
--select sincronizacion_tem('ESECO', '400101');
--select sincronizacion_tem('ESECO', '400102');
--select sincronizacion_tem('ESECO', '400102');
--select sincronizacion_tem('ESECO', '400103');

-- PARA TAREAS_TEM
CREATE OR REPLACE FUNCTION encu.sincronizacion_tareas_tem_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
begin
    new.cargado      = new.cargado_dm is not null;
    return new;
end;
$BODY$;

CREATE TRIGGER sincronizacion_tareas_tem_trg
    BEFORE INSERT OR UPDATE OF cargado_dm
    ON encu.tareas_tem
    FOR EACH ROW
    EXECUTE PROCEDURE encu.sincronizacion_tareas_tem_trg();
