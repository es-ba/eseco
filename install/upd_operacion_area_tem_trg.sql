--set role eseco_owner;
--set search_path=encu;

CREATE OR REPLACE FUNCTION upd_operacion_area_tem_trg()
  RETURNS trigger AS
$BODY$
begin
    if new.relevador is not null then
        update tem
            set operacion=new.operacion_area,
                relevador=new.relevador
            where area=new.area and habilitada;
            --TODO falta contemplar excluir las encuestas que no se vincularan mas a un dm            
    end if;
    return new;
end;
$BODY$
  LANGUAGE plpgsql ;

/*
CREATE TRIGGER upd_operacion_area_tem_trg
  AFTER UPDATE OF operacion_area, relevador 
  ON areas  
  FOR EACH ROW
  EXECUTE PROCEDURE upd_operacion_area_tem_trg();  
-- */