set serach_path=enc;

set application_name='emilio local psql';

update tem
  set json_encuesta = json_encuesta || jsonb_build_object('c5', '3920-93')
  where enc = '11024';

update tem
  set json_encuesta = json_encuesta || jsonb_build_object('a5', '55')
  where enc = '40815';


select json_encuesta = 
    from tem
    where enc = (
        '49401',
        '55201',
        '57215',
        '32613',
        '35604',
        '42601',
        '57204',
        '22225',
        '45821',
        '22226',
        '35601'
    )
