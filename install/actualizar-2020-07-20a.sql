set search_path = encu;
create table "tokens" (
  "token" text, 
  "date" timestamp, 
  "username" text, 
  "useragent" jsonb
, primary key ("token")
);
grant select, insert, update, delete on "tokens" to eseco_user;
grant all on "tokens" to eseco_owner;

create table "locks" (
  "table_name" text, 
  "record_pk" jsonb, 
  "token" text, 
  "lock_datetime" timestamp, 
  "unlock_datetime" timestamp
, primary key ("table_name", "record_pk")
);
grant select, insert, update on "locks" to eseco_user;
grant all on "locks" to eseco_owner;

alter table "tokens" add constraint "token<>''" check ("token"<>'');
alter table "tokens" alter column "token" set not null;
alter table "tokens" alter column "date" set not null;
alter table "tokens" add constraint "username<>''" check ("username"<>'');
alter table "tokens" alter column "username" set not null;
alter table "tokens" alter column "useragent" set not null;
alter table "locks" add constraint "table_name<>''" check ("table_name"<>'');
alter table "locks" alter column "table_name" set not null;
alter table "locks" alter column "record_pk" set not null;
alter table "locks" add constraint "token<>''" check ("token"<>'');
alter table "locks" alter column "token" set not null;
alter table "locks" alter column "lock_datetime" set not null;

-- FKs
alter table "locks" add constraint "locks tokens REL" foreign key ("token") references "tokens" ("token")  on update cascade;
create index "token 4 locks IDX" ON "locks" ("token");