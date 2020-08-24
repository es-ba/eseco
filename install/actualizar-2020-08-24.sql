set role to eseco201_produc_owner;
set search_path=encu;

create table "tareas" (
  "tarea" text, 
  "nombre" text
, primary key ("tarea")
);
grant select, insert, update, delete on "tareas" to eseco201_produc_admin;
grant all on "tareas" to eseco201_produc_owner;

create table "tareas_tem" (
  "tarea" text, 
  "operativo" text, 
  "enc" text, 
  "persona" text, 
  "accion" text, 
  "fecha_asignacion" date, 
  "resultado" text, 
  "fecha_resultado" date, 
  "notas" date
, primary key ("tarea", "operativo", "enc")
);
grant select, insert, update, delete on "tareas_tem" to eseco201_produc_admin;
grant all on "tareas_tem" to eseco201_produc_owner;

create table "tareas_areas" (
  "tarea" text, 
  "area" integer
, primary key ("tarea", "area")
);
grant select, insert, update, delete on "tareas_areas" to eseco201_produc_admin;
grant all on "tareas_areas" to eseco201_produc_owner;

create table "resultados_tarea" (
  "resultado" text, 
  "descripcion" text
, primary key ("resultado")
);
grant select, insert, update, delete on "resultados_tarea" to eseco201_produc_admin;
grant all on "resultados_tarea" to eseco201_produc_owner;

alter table "tareas" add constraint "tarea<>''" check ("tarea"<>'');
alter table "tareas" add constraint "nombre<>''" check ("nombre"<>'');

alter table "tareas_tem" add constraint "tarea<>''" check ("tarea"<>'');
alter table "tareas_tem" add constraint "operativo<>''" check ("operativo"<>'');
alter table "tareas_tem" add constraint "enc<>''" check ("enc"<>'');
alter table "tareas_tem" add constraint "persona<>''" check ("persona"<>'');
alter table "tareas_tem" add constraint "accion<>''" check ("accion"<>'');
alter table "tareas_tem" add constraint "resultado<>''" check ("resultado"<>'');

alter table "tareas_tem" add constraint "tareas_tem tem REL" foreign key ("operativo", "enc") references "tem" ("operativo", "enc")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem tareas REL" foreign key ("tarea") references "tareas" ("tarea")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem usuarios REL" foreign key ("persona") references "usuarios" ("idper")  on update cascade;
alter table "tareas_tem" add constraint "tareas_tem resultados_tarea REL" foreign key ("resultado") references "resultados_tarea" ("resultado")  on update cascade;

create index "operativo,enc 4 tareas_tem IDX" ON "tareas_tem" ("operativo", "enc");
create index "tarea 4 tareas_tem IDX" ON "tareas_tem" ("tarea");
create index "persona 4 tareas_tem IDX" ON "tareas_tem" ("persona");
create index "resultado 4 tareas_tem IDX" ON "tareas_tem" ("resultado");

alter table "tareas_areas" add constraint "tarea<>''" check ("tarea"<>'');

alter table "tareas_areas" add constraint "tareas_areas tareas REL" foreign key ("tarea") references "tareas" ("tarea")  on update cascade;
alter table "tareas_areas" add constraint "tareas_areas areas REL" foreign key ("area") references "areas" ("area")  on update cascade;

create index "tarea 4 tareas_areas IDX" ON "tareas_areas" ("tarea");
create index "area 4 tareas_areas IDX" ON "tareas_areas" ("area");

alter table "resultados_tarea" add constraint "resultado<>''" check ("resultado"<>'');
alter table "resultados_tarea" add constraint "descripcion<>''" check ("descripcion"<>'');

insert into tareas (tarea, nombre) values('rel','relevamiento'), ('sup','supervisión'), ('sen','sensibilización');

do $SQL_ENANCE$
 begin
PERFORM enance_table('tareas','tarea');
PERFORM enance_table('tareas_tem','tarea,operativo,enc');
PERFORM enance_table('tareas_areas','tarea,area');
PERFORM enance_table('resultados_tarea','resultado');
 end
$SQL_ENANCE$;

