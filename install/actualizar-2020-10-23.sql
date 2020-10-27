set role to eseco202_produc_owner;
set search_path = encu;

alter table tem
  add column if not exists cluster integer,
  add column if not exists rotacion integer,
  add column if not exists cita text,
  add column if not exists rea_anterior bigint,
  add column if not exists seleccionado_anterior jsonb,
  add column if not exists clase text;
