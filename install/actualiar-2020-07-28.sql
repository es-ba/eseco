set role to eseco201_produc_owner;

create table "no_rea" (
  "no_rea" text, 
  "descripcion" text, 
  "grupo" text, 
  "variable" text, 
  "valor" text
, primary key ("no_rea")
);
grant select, insert, update, delete on "no_rea" to eseco201_produc_admin;
grant all on "no_rea" to eseco201_produc_owner;

alter table "no_rea" add constraint "no_rea<>''" check ("no_rea"<>'');
alter table "no_rea" add constraint "descripcion<>''" check ("descripcion"<>'');
alter table "no_rea" add constraint "grupo<>''" check ("grupo"<>'');
alter table "no_rea" add constraint "variable<>''" check ("variable"<>'');
alter table "no_rea" add constraint "valor<>''" check ("valor"<>'');
select enance_table('no_rea','no_rea');

insert into "no_rea" ("no_rea", "descripcion", "grupo", "variable", "valor") values
('1', 'La vivienda está deshabitada', 'recuperable', 'dv2', '1'),
('2', 'La vivienda está demolida', 'irrecuperable', 'dv2', '2'),
('3', 'La vivienda se usa solo los fines de semana o muy esporádicamente', 'recuperable', 'dv2', '3'),
('4', 'La vivienda está en construcción y allí no vive nadie', 'irrecuperable', 'dv2', '4'),
('5', 'La vivienda se usa como establecimiento y no tiene uso residencial', 'irrecuperable', 'dv2', '5'),
('6', 'En la dirección de referencia no se encuentra la vivienda especificada', 'problema listado', 'dv2', '6'),
('7', 'Los habitantes de la vivienda están ausentes', 'recuperable', 'dv2', '7'),
('8', 'Los habitantes de la vivienda rechazan ser entrevistados', 'rechazo simple', 'dv2', '8'),
('9', 'Otras causas', 'recuperable', 'dv2', '9'),
('101', 'COVID positivo en la vivienda', 'irrecuperable', 'dv4', '1'),
('91', 'No hay mayores presentes', 'recuperable', 'dv5', '2'),
('81', 'No aceptó firmar el consentimiento', 'rechazo irrecuperable', 's1', '1'),
('82', 'No aceptó contestar el cuestionario', 'rechazo irrecuperable', 's2', '2'),
('83', 'No aceptó realizarse el test', 'rechazo irrecuperable', 's3', '3'),
('102', 'COVID positivo del seleccionado', 'irrecuperable', 'd5c', '1');
