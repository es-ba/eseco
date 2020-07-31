set search_path = encu;

insert into "roles" ("rol", "superuser", "nombre") values
('comunicacion', 'false', 'Comunicacion');

insert into "permisos" ("permiso", "accion", "predeterminado") values
('lab_resultado', 'avisar', 'false');

insert into "roles_permisos" ("rol", "permiso", "accion", "habilitado") values
('admin', 'lab_resultado', 'avisar', 'false'),
('coor_campo', 'lab_resultado', 'avisar', 'false'),
('direccion', 'lab_resultado', 'avisar', 'false'),
('dis_conceptual', 'lab_resultado', 'avisar', 'false'),
('jefe_equipo', 'lab_resultado', 'avisar', 'false'),
('jefe_lab', 'lab_resultado', 'avisar', 'true'),
('lab', 'lab_resultado', 'avisar', 'true'),
('comunicacion', 'campo', 'editar', 'false'),
('comunicacion', 'campo', 'ver', 'false'),
('comunicacion', 'casilleros_texto', 'editar', 'false'),
('comunicacion', 'configurar', 'editar', 'false'),
('comunicacion', 'configurar', 'ver', 'false'),
('comunicacion', 'consistencias', 'editar', 'false'),
('comunicacion', 'encuestas', 'ingresar', 'false'),
('comunicacion', 'encuestas', 'justificar', 'false'),
('comunicacion', 'encuestas', 'procesar', 'false'),
('comunicacion', 'lab_resultado', 'ver', 'true'),
('comunicacion', 'lab_resultado', 'editar', 'false'),
('comunicacion', 'lab_resultado', 'avisar', 'true'),
('procesamiento', 'lab_resultado', 'avisar', 'false'),
('recepcionista', 'lab_resultado', 'avisar', 'false'),
('relevador', 'lab_resultado', 'avisar', 'false');

insert into "roles_subordinados" ("rol", "rol_subordinado") values
('jefe_lab', 'comunicacion');

alter table etiquetas add column  avisado_fecha date;
alter table etiquetas add column  avisado_quien text; 
alter table etiquetas add column  avisado_observaciones text;

alter table "etiquetas" add constraint "avisado_quien<>''" check ("avisado_quien"<>'');
alter table "etiquetas" add constraint "avisado_observaciones<>''" check ("avisado_observaciones"<>'');
alter table "etiquetas" add constraint "etiquetas avi REL" foreign key ("avisado_quien") references "usuarios" ("usuario")  on update cascade;
create index "avisado_quien 4 etiquetas IDX" ON "etiquetas" ("avisado_quien");