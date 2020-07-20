--set role eseco_owner;
--set search_path=encu;

CREATE OR REPLACE FUNCTION upd_operacion_area_tem_trg()
  RETURNS trigger AS
$BODY$
begin
    update tem
      set operacion=new.operacion_area,
          relevador=new.relevador
      where area=new.area and habilitada; 
    return new;
end;
$BODY$
  LANGUAGE plpgsql ;

/*
CREATE TRIGGER upd_operacion_area_tem_trg
  AFTER UPDATE OF operacion_area
  ON areas  
  FOR EACH ROW
  EXECUTE PROCEDURE upd_operacion_area_tem_trg();  
-- */  