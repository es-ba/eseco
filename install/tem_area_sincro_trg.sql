--set role eseco_owner;
--set search_path=encu;

CREATE OR REPLACE FUNCTION tem_area_sincro_trg()
  RETURNS trigger AS
$BODY$
declare
  js_enc_vacio jsonb= '{"personas":[]}'::jsonb;
begin
    
    update areas a
      set (cargadas,reas,no_reas,incompletas,vacias,inhabilitadas)=(
          select count(cargado_dm)                                as cargadas,
              sum ( rea_m )                                       as reas,
              count(*) filter ( where etiqueta is null and coalesce(json_encuesta,js_enc_vacio) <> js_enc_vacio )            as no_reas,
              count(*) filter ( where coalesce(json_encuesta,js_enc_vacio) <> js_enc_vacio and resumen_estado in ('incompleto', 'con problemas') ) as incompletas, 
              count(*) filter ( where etiqueta is null and nullif(json_encuesta,js_enc_vacio) is null )                      as vacias,
              count(*) filter ( where habilitada is not true )    as inhabilitadas
              from tem
              where area=a.area
      )
      where a.area=new.area;
    return new;

end;
$BODY$
  LANGUAGE plpgsql ;


DROP TRIGGER IF EXISTS tem_area_sincro_trg ON tem ;
CREATE TRIGGER tem_area_sincro_trg
  AFTER INSERT OR DELETE OR UPDATE OF cargado_dm, etiqueta, json_encuesta, habilitada, resumen_estado
  ON tem
  FOR EACH ROW
  EXECUTE PROCEDURE tem_area_sincro_trg();  
  