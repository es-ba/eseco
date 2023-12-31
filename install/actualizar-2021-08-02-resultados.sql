set search_path= encu;
SET role eseco211_produc_owner;

alter table etiquetas add column resultado_s text;
alter table etiquetas add column resultado_n text;
alter table etiquetas add column resultado_d text;


alter table "resultados_test" add constraint "resultado_s<>''" check ("resultado"<>'');
alter table "resultados_test" add constraint "resultado_n<>''" check ("resultado"<>'');
alter table "resultados_test" add constraint "resultado_d<>''" check ("resultado"<>'');

alter table "etiquetas" add constraint "etiquetas_s resultados_test REL" foreign key ("resultado_s") references "resultados_test" ("resultado")  on update cascade;
alter table "etiquetas" add constraint "etiquetas_n resultados_test REL" foreign key ("resultado_n") references "resultados_test" ("resultado")  on update cascade;
alter table "etiquetas" add constraint "etiquetas_d resultados_test REL" foreign key ("resultado_d") references "resultados_test" ("resultado")  on update cascade;

CREATE OR REPLACE FUNCTION calcular_resultado_etiqueta_trg() 
  RETURNS trigger
  LANGUAGE plpgsql
AS
$BODY$
begin
  if new.resultado_n is null and new.resultado_s is null then 
    --si los dos son estrictamente null da null
    new.resultado = null;
  elsif new.resultado_n = 'Positivo' or new.resultado_s = 'Positivo' then 
    --si uno es positivo es positivo
    new.resultado = 'Positivo'; 
  elsif new.resultado_n = 'Negativo' and new.resultado_s = 'Negativo' then 
    --solo es negativo si los dos son negativo  
    new.resultado = 'Negativo' ;
  else
    --si los dos son escasa muestra o indeterminado queda indeterminado o solo uno de los dos es null
    --if (new.resultado_n in ('Escasa muestra','Indeterminado', 'Negativo') or new.resultado_n is null) and 
    --  (new.resultado_s in ('Escasa muestra','Indeterminado', 'Negativo') or new.resultado_s is null) then 
    new.resultado = 'Indeterminado'; 
  end if;
  return new;
end;
$BODY$;

-- /*
drop trigger if exists calcular_resultado_etiqueta_trg on etiquetas;
CREATE TRIGGER calcular_resultado_etiqueta_trg
  BEFORE UPDATE OF resultado_s, resultado_n
  ON etiquetas
  FOR EACH ROW
  EXECUTE PROCEDURE calcular_resultado_etiqueta_trg();