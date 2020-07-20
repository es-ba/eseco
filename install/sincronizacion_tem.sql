--set role to eseco_owner;
--set search_path = encu;

create or replace function sincronizacion_tem_trg() returns trigger
  language plpgsql
AS
$BODY$
declare
  datos         jsonb=new.json_encuesta;
begin
    new.etiqueta     = datos ->>'c5'; 
    new.rea          = CASE (datos ->>'dv1')::integer when 1 then 1 when 2 then 0 else null end;
    new.norea        = (datos ->>'dv3')::integer ;
    new.cant_p       = (datos ->>'cp') ::integer ;
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