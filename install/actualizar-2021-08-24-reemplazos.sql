set search_path= encu;
SET role eseco211_produc_owner;

select enc, nomcalle, nrocatastral, nrocomuna, zona, resumen_estado,rea, norea, json_encuesta, obs
 from tem where area in (801,806,717)
 order by 1;
update tem   set nomcalle='MEXICO', nrocatastral=677
  where  area= 801 and nomcalle='CHACABUCO' AND nrocatastral=560;
update tem   set nomcalle='SANCHEZ DE BUSTAMANTE', nrocatastral=607,
    resumen_estado=null, rea=null, norea=null, json_encuesta=jsonb_build_object('g1',4, 'personas','[]'::jsonb, 'tipo_seleccion',2, 'tipo_relevamiento', 1)
  where  area= 806 and nomcalle='BILLINGHURST' AND nrocatastral=659;

update tem  set nomcalle='BAHÍA BLANCA 1757'
    , obs='RESIDENCIA GERIATRICA BAHIA BLANCA', resumen_estado=null
  where  area= 717 and nomcalle='MORON  4520  FLORESTA CABA';
