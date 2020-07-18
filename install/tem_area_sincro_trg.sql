--set role eseco_owner;
--set search_path=encu;

CREATE OR REPLACE FUNCTION tem_area_sincro_trg()
  RETURNS trigger AS
$BODY$
begin
    update areas a
    set (cargadas,reas,no_reas,incompletas,vacias,inhabilitadas)=(
        select count(cargado_dm) as cargadas,
            count(etiqueta)        as reas,
            count(*) filter ( where etiqueta is null and json_encuesta is not null ) as no_reas,
            null::integer as incompletas, -- definir 
            count(*) filter ( where etiqueta is null and json_encuesta is null )as vacias,
            count(*) filter ( where habilitada is not true ) as inhabilitadas
            from tem
            where area=a.area)
    where a.area=new.area;
    return new;
end;
$BODY$
  LANGUAGE plpgsql ;

/*
CREATE TRIGGER tem_area_sincro_trg
  AFTER INSERT OR DELETE OR UPDATE OF cargado_dm, etiqueta, json_encuesta, habilitada
  ON tem
  FOR EACH ROW
  EXECUTE PROCEDURE tem_area_sincro_trg();  
*/  