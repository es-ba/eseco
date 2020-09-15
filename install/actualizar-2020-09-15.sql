set role to eseco202_produc_owner;
set search_path = encu;

--punto 10
DROP TRIGGER IF EXISTS upd_operacion_tareas_areas_tem_trg ON tareas_areas;
CREATE TRIGGER upd_operacion_tareas_areas_tem_trg
   AFTER INSERT OR UPDATE OF operacion, asignado,fecha_asignacion,asignante 
   ON encu.tareas_areas
   FOR EACH ROW
   EXECUTE PROCEDURE encu.upd_operacion_tareas_area_tem_trg();   

