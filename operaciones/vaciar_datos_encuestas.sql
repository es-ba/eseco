set search_path = encu;

update areas set relevador=null, recepcionista=null, verificado_rec = null, obs_recepcionista = null, observaciones_hdr = null;
--delete from areas;
delete from tareas_tem;
delete from tareas_areas;