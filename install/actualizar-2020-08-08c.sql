set role to eseco201_produc_owner;
set search_path=encu;

set application_name='emilio local psql';

update tem
  set json_encuesta = json_encuesta || jsonb_build_object('c5', '3920-93')
  where enc = '11024';

update tem
  set json_encuesta = json_encuesta || jsonb_build_object('a5', '55')
  where enc = '40815';


update tem set json_encuesta =  (
            select h.cha_new_value::jsonb
                from his.changes h
                where enc = cha_new_pk->>'enc'
                    and cha_table='tem'
                    and cha_column='json_encuesta'
                    and h.cha_new_value::jsonb->>'c5' is not null
                order by h.cha_when desc
                limit 1
        )
    where enc in (
        '22225',
        '22226',
        '32613',
        '35601',
        '35604',
        '42601',
        '45821',
        '49401',
        '55201',
        '57204',
        '57215'
    );


select tem.enc, (
            select h.cha_new_value::jsonb->>'c5' as c5
                from his.changes h
                where enc = cha_new_pk->>'enc'
                    and cha_table='tem'
                    and cha_column='json_encuesta'
                    and h.cha_new_value::jsonb->>'c5' is not null
                order by h.cha_when desc
                limit 1
        )
    from tem
    where enc in (
        '22225',
        '22226',
        '32613',
        '35601',
        '35604',
        '42601',
        '45821',
        '49401',
        '55201',
        '57204',
        '57215'
    );

update tem set json_encuesta = '{"personas":[]}'
    where enc in (
        '42601',
        '57204',
        '57215'
    );
