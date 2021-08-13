set role to eseco211_produc_owner;

set search_path = encu;


CREATE OR REPLACE FUNCTION calcular_resultado_etiqueta_trg() 
  RETURNS trigger
  LANGUAGE plpgsql
AS
$BODY$
begin
  new.resultado= new.resultado_s; 
  return new;
end;
$BODY$;

-- /*
drop trigger if exists calcular_resultado_etiqueta_trg on etiquetas;
CREATE TRIGGER calcular_resultado_etiqueta_trg
  BEFORE UPDATE OF resultado_s
  ON etiquetas
  FOR EACH ROW
  EXECUTE PROCEDURE calcular_resultado_etiqueta_trg();

-- */
/*
update etiquetas
  set resultado= resultado_s
  --select count(*) from etiquetas
  where resultado is distinct from resultado_s and fecha is not null and laboratorista is not null;
*/  