set search_path=encu;
--set role eseco_owner;
set role to eseco201_produc_owner;

alter table tem add column frel  date;

--tipo_domicilio
alter table tem add column tipo_domicilio integer;
update tem
  set tipo_domicilio=1
  where area<700 and reserva<=2; 
update tem
  set tipo_domicilio=3
  where area >=900; --todavia no estan cargadas???

--modificacion de json_encuesta
--g1=1
update tem 
  set json_encuesta= json_encuesta||jsonb_build_object('g1', tipo_domicilio)
  where tipo_domicilio=1 ;     --and not json_encuesta?'g1' ;

--g1=3
--select json_encuesta||jsonb_build_object('g1', 3, 'ug2',nomcalle,'ug3',nrocomuna,'ug4',nrofraccion,'ug5',nroradio,'ug6',nromanzana,'ug7',casa,'g9',obsdatosdomicilio), *
--  from tem where dominio=5;

update tem 
  set json_encuesta= json_encuesta||jsonb_build_object('g1', tipo_domicilio, 'ug2',nomcalle,'ug3',nrocomuna,'ug4',nrofraccion,'ug5',nroradio,'ug6',nromanzana,'ug7',casa,'g9',obsdatosdomicilio)
  where tipo_domicilio=3;          --and not json_encuesta?'g1' ;
--en nomcalle esta cargada la descripcion del barrio