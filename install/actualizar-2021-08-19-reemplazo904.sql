set search_path= encu;
SET role eseco211_produc_owner;

select * into norea_bkp from no_rea;

--select * from no_rea where grupo0~'ausentes y';
update no_rea set grupo0='ausentes'  where  no_rea ~'^(7|75|12)$';
update no_rea set grupo0='rechazos'  where  no_rea ~'^(8|81|82|83|85)$' and grupo0~'ausentes y';
update no_rea set grupo0='otras causas' where no_rea='9';

/*
select count(*) from tem
  where tipo_domicilio=1 and (json_encuesta->>'dv3' in ('7','12') or json_encuesta->>'sp6'='2');

select count(*) from tem
  where rea_m=1 and tipo_domicilio=1 and (json_encuesta->>'dv3' ='8' 
  or json_encuesta->>'s1' ='2' or json_encuesta->>'s2' ='2' or json_encuesta->>'s3' ='2' or json_encuesta->>'sp6'='3');

select count(*) from tem
  where tipo_domicilio=1 and json_encuesta->>'dv3'='9';
*/