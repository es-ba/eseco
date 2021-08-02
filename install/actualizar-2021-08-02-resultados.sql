set search_path= encu;
SET role eseco211_produc_owner;

alter table etiquetas add column resultado_s text;
alter table etiquetas add column resultado_n text;
alter table etiquetas add column resultado_d text;


alter table "resultados_test" add constraint "resultado_s<>''" check ("resultado"<>'');
alter table "resultados_test" add constraint "resultado_n<>''" check ("resultado"<>'');
alter table "resultados_test" add constraint "resultado_d<>''" check ("resultado"<>'');

alter table "etiquetas" add constraint "etiquetas_s resultados_test REL" foreign key ("resultado_s") references "resultados_test" ("resultado")  on update cascade;
alter table "etiquetas" add constraint "etiquetas_n resultados_test REL" foreign key ("resultado_n") references "resultados_test" ("resultado")  on update cascade;
alter table "etiquetas" add constraint "etiquetas_d resultados_test REL" foreign key ("resultado_d") references "resultados_test" ("resultado")  on update cascade;
