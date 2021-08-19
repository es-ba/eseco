set search_path= encu;
SET role eseco211_produc_owner;

select enc, nomcalle, nrocomuna, nrofraccion, nroradio, json_encuesta
 from tem where area=904
 order by 1;

--select * from no_rea where grupo0~'ausentes y';
update tem 
  set nomcalle='VILLA 20',
      nrofraccion=7,
      json_encuesta=json_encuesta||jsonb_build_object('ug2','VILLA 20','ug4',7)
  where  area= 904;

