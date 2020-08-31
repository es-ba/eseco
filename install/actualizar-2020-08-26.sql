set role to eseco201_produc_owner;
set search_path=encu;

alter table tareas_areas add column asignado text;
alter table tareas_areas add column operacion text;
alter table tareas_areas add column fecha_asignacion date;
alter table tareas_tem add column asignado text;
alter table tareas_tem add column operacion text;
alter table tareas_areas add column asignante text;
alter table tareas_tem add column asignante text;
