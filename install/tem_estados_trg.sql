set role to eseco_owner;

set search_path = encu;


CREATE OR REPLACE FUNCTION tem_estados_trg() RETURNS trigger
  LANGUAGE plpgsql
AS
$BODY$
begin
  if new.estado is not null then  
    insert into tem_estados (operativo, estado, enc, cuando, carga, carga_persona, carga_rol, carga_observaciones)
      values (new.operativo, new.estado, new.enc, current_timestamp, new.carga, new.carga_persona, new.carga_rol, new.carga_observaciones);
  end if;
  return new;
end;
$BODY$;

-- /*
CREATE TRIGGER tem_estados_trg
  AFTER INSERT OR UPDATE OF estado   -- y cuando cambia de la persona????
  ON tem
  FOR EACH ROW
  EXECUTE PROCEDURE tem_estados_trg();

-- */

