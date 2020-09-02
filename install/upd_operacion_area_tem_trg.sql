--set role eseco201_produc_owner;
--set search_path=encu;
-- DROP FUNCTION encu.upd_operacion_tareas_area_tem_trg();
CREATE OR REPLACE FUNCTION encu.upd_operacion_tareas_area_tem_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
begin
    if new.asignado is not null then
        update tareas_tem tt
            set operacion=new.operacion,
                asignado=new.asignado,
                asignante=new.asignante,
                fecha_asignacion=new.fecha_asignacion
            from tem t   
            where t.operativo=tt.operativo and t.enc=tt.enc 
              and area=t.area and tt.habilitada;            
    end if;
    return new;
end;
$BODY$;

DROP TRIGGER upd_operacion_tareas_areas_tem_trg ON tareas_areas;
CREATE TRIGGER upd_operacion_tareas_areas_tem_trg
   AFTER UPDATE OF operacion, asignado,fecha_asignacion,asignante 
   ON encu.tareas_areas
   FOR EACH ROW
   EXECUTE PROCEDURE encu.upd_operacion_tareas_area_tem_trg();   
