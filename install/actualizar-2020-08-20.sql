set role to eseco201_produc_owner;
set search_path=encu;

create table "resultados_test" (
  "resultado" text, 
  "email_asunto" text, 
  "email_texto" text, 
  "pagina_texto" text
, primary key ("resultado")
);
grant select, insert, update on "resultados_test" to eseco201_produc_admin;
grant all on "resultados_test" to eseco201_produc_owner;

alter table "resultados_test" add constraint "resultado<>''" check ("resultado"<>'');
alter table "resultados_test" alter column "resultado" set not null;
alter table "resultados_test" add constraint "email_asunto<>''" check ("email_asunto"<>'');
alter table "resultados_test" add constraint "email_texto<>''" check ("email_texto"<>'');
alter table "resultados_test" add constraint "pagina_texto<>''" check ("pagina_texto"<>'');

insert into "resultados_test" ("resultado","email_asunto","email_texto","pagina_texto") 
	values('Positivo', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto positivo #nombre #apellido #resultado' , 'texto pagina positivo #nombre #apellido #resultado'),
	('Negativo', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto negativo #nombre #apellido #resultado' , 'texto pagina negativo #nombre #apellido #resultado'),
	('Indeterminado', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto indeterminado #nombre #apellido #resultado' , 'texto pagina indeterminado'),
	('Escasa muestra', 'Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.','texto escasa muestra #nombre #apellido #resultado' , 'texto pagina escasa muestra#nombre #apellido #resultado');

update etiquetas set resultado='Negativo' where resultado='negativo';
update etiquetas set resultado='Positivo' where resultado='positivo';


alter table "etiquetas" add constraint "etiquetas resultados_test REL" foreign key ("resultado") references "resultados_test" ("resultado")  on update cascade;
