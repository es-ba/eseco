---------- actualizacioens desde el 2020-07-20 a la versión de test
---- ACTUALIZACIONES DE RAQUEL

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

CREATE OR REPLACE FUNCTION tem_area_sincro_trg()
  RETURNS trigger AS
$BODY$
declare
  js_enc_vacio jsonb= '{"personas":[]}'::jsonb;
begin
    
    update areas a
      set (cargadas,reas,no_reas,incompletas,vacias,inhabilitadas)=(
          select count(cargado_dm)                                as cargadas,
              count(etiqueta)                                     as reas,
              count(*) filter ( where etiqueta is null and coalesce(json_encuesta,js_enc_vacio) <> js_enc_vacio )            as no_reas,
              count(*) filter ( where coalesce(json_encuesta,js_enc_vacio) <> js_enc_vacio and resumen_estado='incompleto' ) as incompletas, 
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


---- CAMBIOS DE MANUEL

---- NOVEDADES DE EMILIO

alter table encu.etiquetas add column ingreso_lab timestamp;

---- FIN