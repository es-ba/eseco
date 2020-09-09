set role to eseco202_produc_owner;

set search_path = "encu";
alter table tem
  add column if not exists h4 text,
  add column if not exists hospital text,
  add column if not exists x numeric,
  add column if not exists y numeric,
  add column if not exists dist_m numeric;
  
alter table "tem" add constraint "h4<>''" check ("h4"<>'');
alter table "tem" add constraint "hospital<>''" check ("hospital"<>'');
