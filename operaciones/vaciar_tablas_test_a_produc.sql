set search_path= encu;
set role to eseco211_produc_owner;

begin transaction;

delete from tareas_tem;
delete from tareas_areas;
delete from tem;
delete from areas;

delete from etiquetas;
delete from planchas;

commit;