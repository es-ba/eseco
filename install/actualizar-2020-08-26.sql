set role to eseco201_produc_owner;
set search_path=encu;

alter table tareas_tem rename column persona to asignado;
alter table tareas_tem add column asignante text;

alter table tareas_tem rename column accion to operacion;
alter table tareas_areas add column operacion text;
alter table tareas_areas add column fecha_asignacion date;
