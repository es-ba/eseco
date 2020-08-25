set role to eseco201_produc_owner;
set search_path=encu;

alter table tareas_tem alter column notas type text;
--alter table tareas_areas add column persona type text;
--alter table tareas_areas add column accion type text;
--alter table tareas_areas add column fecha_asignacion type date;