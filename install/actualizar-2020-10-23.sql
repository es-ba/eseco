set role to eseco202_produc_owner;
set search_path = encu;

alter table tem add column rea_anterior bigint;
alter table tem add column seleccionado_anterior jsonb;

alter table tem
  add column if not exists cluster integer,
  add column rotacion integer,
  add column clase    text;
