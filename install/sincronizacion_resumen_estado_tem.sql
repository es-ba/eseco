set role to eseco202_produc_owner;
set search_path = encu;

CREATE OR REPLACE FUNCTION encu.sincronizacion_resumen_estado_tem_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
declare
  resumen_estado         text=new.resumen_estado;
begin
	update tareas_tem tt 
		set resultado = 
			(case 
				when resumen_estado is distinct from 'vacio' and resumen_estado is distinct from 'no rea' then resumen_estado  
				when resumen_estado = 'no rea' then COALESCE(tt.resultado,'') || '-' ||resumen_estado
				else null
			end)
		where tt.operativo = NEW.operativo and tt.enc = NEW.enc;
    return new;
end;
$BODY$;

drop trigger if exists sincronizacion_resumen_estado_tem_trg on tem;
CREATE TRIGGER sincronizacion_resumen_estado_tem_trg
  BEFORE INSERT OR UPDATE OF resumen_estado
  ON tem
  FOR EACH ROW
  EXECUTE PROCEDURE sincronizacion_resumen_estado_tem_trg();