set search_path = encu; set role to eseco201_produc_owner;

create table "sincronizaciones" (
  "sincro" bigint, 
  "token" text, 
  "usuario" text, 
  "cuando" timestamp default current_timestamp, 
  "datos" jsonb
, primary key ("sincro")
);
grant select, insert, update, delete on "sincronizaciones" to eseco201_produc_admin;
grant all on "sincronizaciones" to eseco201_produc_owner;


CREATE SEQUENCE "sincronizacines_seq" START 101;
ALTER TABLE "sincronizaciones" ALTER COLUMN "sincro" SET DEFAULT nextval('sincronizacines_seq'::regclass);
GRANT USAGE, SELECT ON SEQUENCE "sincronizacines_seq" TO eseco201_produc_admin;
alter table "sincronizaciones" add constraint "token<>''" check ("token"<>'');
alter table "sincronizaciones" add constraint "usuario<>''" check ("usuario"<>'');
