--set role eseco201_produc_owner;
--set search_path=encu;
-- DROP FUNCTION encu.upd_operacion_tareas_area_tem_trg();
CREATE OR REPLACE FUNCTION encu.upd_operacion_tareas_area_tem_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
begin
    update tareas_tem tt
        set operacion        = case when new.operacion        is not null and new.operacion        is distinct from old.operacion        then new.operacion        else operacion        end,
            asignado         = case when new.asignado         is not null and new.asignado         is distinct from old.asignado         then new.asignado         else asignado         end,
            fecha_asignacion = case when new.fecha_asignacion is not null and new.fecha_asignacion is distinct from old.fecha_asignacion then new.fecha_asignacion else fecha_asignacion end
        from tem t   
        where t.operativo=tt.operativo and t.enc=tt.enc 
            and area=t.area and tt.habilitada
            and tt.tarea=new.tarea
            and area=new.area;            
    return new;
end;
$BODY$;

DROP TRIGGER IF EXISTS upd_operacion_tareas_areas_tem_trg ON tareas_areas;
CREATE TRIGGER upd_operacion_tareas_areas_tem_trg
   AFTER INSERT OR UPDATE OF operacion, asignado,fecha_asignacion,asignante 
   ON encu.tareas_areas
   FOR EACH ROW
   EXECUTE PROCEDURE encu.upd_operacion_tareas_area_tem_trg();   
