// ***@type {string} 

// import {promises as fs} from "fs";
var fs = require('fs').promises

var datos = `59216	5	Jorge	1	38
14801	3	Gonzalo larralde	1	44
16215	2	Valeria	2	50
51425	3	Alex	1	27
57202	3	Adriana	2	53
58016	1	Silvana	2	56
58622	4	Laura	2	23
59813	4	Maria	2	18
61024	5	Maria	2	71
61222	2	Gabriel	1	19
61613	2	Edgardo	1	63
62814	2	Delfina	2	28
62816	2	Solange	2	49
67204	3	Belen	2	22
67606	3	Alan	1	18
68616	4	Dardo Agustin	1	21
69226	3	Clara	2	19
15022	2	Nicolas pliner	1	41
17424	1	Jose	1	25
17814	1	Ana	2	57
50013	3	Micarla	2	19
50416	3	Rodrigo	1	25
50621	2	Dora	2	71
51001	3	Hernan Gómez	1	30
51026	2	Julián	1	43
51404	3	Nancy	2	50
52805	2	Carlos	1	78
53001	4	Gladis	2	53
53214	2	Fabyhuzca millan	2	30
53223	3	Ricardo	1	51
53602	1	Pedro	1	45
53813	2	Eduardo	1	57
54815	2	Cindy	2	25
55025	2	Patricia	2	52
55621	2	Sofia	2	24
56014	3	Jose luis	1	49
56824	2	Sabrina	2	41
57423	2	Norberto	1	63
58413	2	Maxi	1	25
58612	2	Carolina	2	42
58801	3	Malena	2	21
58803	2	Alejandro Antonio	1	49
59604	2	juan	1	51
62002	4	Juan	1	48
66605	3	Mauricio	1	28
66815	2	Rita	2	52
67203	2	Francesco	1	26
68825	2	Leticia	2	60
14603	2	Malen	2	28
14611	2	Maria febe	2	26
14612	2	Antonia	2	24
14624	2	Milagros	2	25
14625	2	Carolina	2	31
15203	2	Nilda Ester Molina	2	39
15206	3	Matias Altinier	1	31
15211	2	Lucas talamoni	1	40
15404	2	Maria isabel jordana	2	46
15426	2	Natalia Torales	2	32
15604	2	Mercedes	2	37
15616	1	Lidia	2	54
15622	2	Sabrina	2	27
16026	2	Abril	2	25
16422	2	Luis	1	75
16604	2	Delfina Galati	2	27
16605	2	 Marcos	1	25
16804	2	Sara	2	75
16812	1	Enrique	1	82
16813	2	Josefina	2	29
16816	2	Alfredo	1	83
17011	2	Francisco	1	37
17201	2	Nicolas	1	29
17211	2	Eduardo	1	66
17613	5	Sebastián	1	59
17803	1	Francisco	1	42
17804	2	Pablo	1	31
17805	2	Matias	1	24
17806	3	Luis	1	80
17816	2	Rodolfo	1	63
49804	1	Paula	2	25
49815	2	Matias	1	40
49821	1	Elisa	2	39
49822	2	Juan manuel	1	33
50022	2	Valeria	2	45
50203	2	Eugenio	1	28
50216	2	Carolina	2	30
50404	1	Maria	2	72
50406	2	Ireneo	1	85
50413	2	Sonia	2	51
50605	2	Jonatan	1	29
50616	2	Gabriela	2	35
50623	2	Maria leticia	2	43
50624	3	Claudio	1	60
50801	2	Lucia	2	30
51013	2	Mónica	2	40
51014	2	Leticia Penélope	2	36
51406	1	pilar	2	26
51816	2	Florencia	2	44
52011	2	Monica	2	69
52012	2	Luciana	2	48
52021	3	Beatriz	2	63
52204	2	Fabian	1	55
52205	2	Diana	2	36
52214	2	Teresita	2	60
52402	2	Judith hidalgon	2	37
52405	2	Ari	1	37
52423	2	Gabriela	2	33
52603	2	Maria eugenia	2	27
52621	2	Clara	2	65
52804	2	Gabriel	1	39
52806	2	Alejandro	1	52
53005	2	Susana	2	70
53025	2	Gillermo	1	79
53213	2	Susana	2	70
53411	2	Tomas	1	44
53416	2	Lara	2	35
53606	2	Roberto	1	81
53613	2	Laura	2	51
53621	1	Roberto	1	68
53811	2	Werner	1	84
53816	2	Gloria	2	57
54021	2	Graciela	2	63
54216	2	Miguel	1	55
54221	2	María	2	63
54401	2	Pilar	2	37
54403	2	Mateo	1	38
54406	2	Roberto	1	66
54414	2	Marcelo	1	36
54602	2	Daniela totaro	2	40
54603	1	Maria carogana	2	34
54621	2	Perla rodriguez	2	47
54626	2	Jaime lipmanm	1	89
54802	2	María del carmen	2	66
54806	2	Agustin	1	46
54816	2	Esteban	1	37
55002	2	Mora	2	37
55005	2	Javier	1	49
55015	2	Luis jose	1	95
55016	2	Graciela	2	70
55203	2	Lazaro	1	47
55213	2	Jose bianchi	1	48
55214	4	Lucia	2	35
55225	1	Ofelia	2	74
55411	3	Patricio	1	38
55415	2	Geraldine	2	30
55416	3	Gustavo	1	62
55421	2	Angela	2	85
55602	2	Osvaldo	1	40
55615	2	Nancy	2	25
55624	2	Mirta	2	61
55625	2	German	1	61
55812	2	Gladys	2	49
55824	2	Agustina	2	28
55826	2	Gerardo	1	45
56013	2	Andrea	2	51
56015	2	Luisa	2	90
56025	2	Frida	2	21
56203	2	Micaela	2	26
56214	2	Celmira	2	45
56412	2	Luis	1	60
56421	2	Paula veronica	2	46
56424	2	Nelly nonino	2	92
56425	2	Nicolas	1	42
56613	2	Paula	2	26
56616	2	Mariel	2	54
56621	2	Ana	2	37
56805	1	Lorena	2	35
56821	1	Sebastian	1	32
57001	2	Ramiro ojeda	1	36
57004	2	Alfredo	1	32
57012	2	Melisa	2	26
57223	2	Guillermo	1	49
57825	2	Mariana	2	45
58006	2	Niña	2	41
58205	2	luciana	2	26
58216	2	Leticia	2	36
58611	2	Martin	1	37
58811	2	Alejandro	1	32
58816	2	Francisco	1	25
58822	2	Jana	2	30
59006	2	Manuel	1	34
59014	2	Sandra	2	49
59021	2	Guillermo	1	62
59412	2	Erica	2	43
59413	2	Amaia	2	24
59422	2	Douglas	1	27
59812	4	Francisco	1	35
59815	2	Madelon	1	63
59822	3	Lucrecia	2	45
59826	2	Josefina	2	27
60016	2	Santiago	1	25
60405	2	Alejandra	2	38
60412	2	Maria	2	27
60414	2	Petrona	2	62
60415	1	Luis	1	33
60421	2	maria	2	68
60603	2	Genesis	2	25
60612	1	Monica	2	67
60615	2	Andrea	2	30
60802	2	Cesilia	2	47
60814	2	 Marcelo	1	58
60824	1	Rodrigo	1	44
61025	2	Angeles	2	32
61026	2	Ana	2	74
61216	1	Sara	2	30
61426	2	Juan diego chapay	1	29
61615	2	Diana	2	61
61626	2	Evangelina	2	32
61802	2	Maria	2	47
62001	2	David	1	38
62014	4	Juan	1	54
62022	2	Karina	2	43
62201	2	Santiago	1	26
62202	2	Araceli	2	53
62203	2	Hafedh	1	47
62206	2	Tatiana	2	32
62413	2	Marcelo	1	63
62621	2	Lucia	2	66
62801	2	Mariano	1	20
62811	2	Angel	1	74
62813	2	Maximiliano	1	30
66625	2	Juan	1	27
66812	3	wendi	2	24
67213	2	Kevin	1	25
67411	3	Lucas	1	26
67416	2	Dennise	2	27
67605	2	Francois	1	36
67611	2	Cecile	2	59
67616	2	Roxana	2	43
67622	2	Norah	2	42
67625	2	Zacarias	1	49
67803	2	Andres	1	70
67806	2	Marina	2	72
67813	2	Claudio	1	56
67823	2	Maria Victoria	2	37
68605	2	Alejandro	1	86
68612	2	Gabriela	2	57
68811	2	Julia	2	37
68823	2	Barbara	2	33
69023	1	Lucas	1	37
69025	2	Walter	1	57
69204	1	Maria victoria	2	42
69206	2	Tomas	1	38
69405	2	Jorge	1	59
69406	2	Juan	1	28
69412	2	Inés	2	77
69611	2	Fernanda	2	49
69614	2	Maria	2	30
69621	2	Luciana	2	38
69623	2	Gabriela	2	53
69802	2	Marta	2	72
69824	2	Osvaldo	1	55
33813	7	Alejandra	2	21
21006	4	Lola	2	19
23622	3	Leila	2	24
36814	5	Juan barrios	1	21
38412	2	Gomez Maria Elena	2	51
41024	2	Franco	1	24
41423	2	Mariela	2	41
43001	4	Luciana	2	20
20405	4	Luciana	2	22
20603	1	Javier	1	31
24005	3	Maria	2	51
24021	4	Eugenia	2	44
32602	2	Cintia	2	36
33821	2	Graciela	2	56
34402	1	ruben	1	59
35603	2	franco	1	19
37212	2	Florencia	2	24
37824	4	Theo	1	18
38403	2	Castillo Raul	1	62
39001	2	Mariano Bianco	1	50
39026	4	Mariana Andrea Milici	2	31
39603	2	Luisa	2	56
39822	1	Susana	2	53
40411	3	Estela	2	64
41405	5	Francisca	2	68
41413	2	Silvia	2	59
41424	2	Fernando	1	56
41626	1	Marcelina	2	41
20404	3	Elias	1	25
20613	2	Veronica	2	41
20615	2	Bianca	2	20
20622	2	Graciela	2	42
20624	2	Daniela	2	18
20811	2	Vanesa	2	45
20812	2	Viviana	2	42
21206	3	Sabrina	2	35
21212	3	Maximiliano	1	23
21405	3	Nahuel	1	22
21415	3	Juan	1	22
21615	3	Cintia	2	44
21815	3	VILLAROEL Abigail Micaela	2	19
22011	1	Fabian	1	53
22015	5	Aurea	2	77
22201	3	Osvaldo	1	45
22804	2	Jacquelina	2	53
22806	2	Silvia	2	66
22821	2	Valentín	1	45
23206	6	adolfo	1	40
23606	3	Miguel	1	26
23813	3	Patricia	2	57
24201	4	Néstor	1	38
32605	3	Melina	2	26
32811	3	Gustavo	1	55
33205	2	Maria Jose Igarzabal	2	30
33216	3	Moreira Facundo	1	24
33403	3	Agustin	1	18
34003	3	Antonella	2	26
34004	3	Ray	1	40
34022	3	Maritza	2	27
34822	3	federico	1	23
35026	2	Juana	2	100
35811	3	Marcelo Zottola	1	52
36001	2	Cornelio aslith	1	34
36003	2	Maria bruno	2	55
36206	4	Melisa	2	26
36211	3	Maria luz larrañaga cristiano	2	19
36212	3	Gonzalez Delia	2	59
36403	3	Analia	2	42
36411	3	Juliam	1	18
36415	3	Gaston	1	38
36616	3	Veronica Marela Roberto	2	45
36801	2	Daniel	1	56
37204	3	Laura	2	33
38004	4	Ezequiel	1	19
38211	3	Ana Lia Veronica Puglese	2	37
38224	2	Silvia	2	32
38402	6	Elvira Molina	2	69
38415	3	Leandro Leguizamon	1	46
38416	1	Mirian Marca	2	42
39025	3	Juana Molina Gonzales	2	59
39401	2	Jose	1	76
39612	2	Paola	2	44
40003	2	patrcia	2	54
40401	3	Ariel	1	26
40804	3	Agustin Lopez Joffre	1	18
41013	1	Lucas	1	26
41811	3	Rodrigo	1	27
42202	3	Mariza	2	57
42205	4	Abigail	2	44
42413	3	Sebastian	1	28
42623	2	Evelyn	2	26
43015	2	Nicolas contrerad	1	35
43213	2	Graciela	2	60
43404	2	Enrique daniel	1	62
43823	3	Micaela Higa	2	26
68415	2	Juan Fernandez	1	64
20804	2	Sandra	2	39
21002	1	Martin	1	33
21003	1	Katherin	2	19
21013	2	Jose	1	66
21201	3	Pablo	1	28
21202	2	Alejandro	1	48
21402	2	Lucas	1	35
21414	2	Noela	2	38
21601	2	juan	1	34
21605	2	Ana	2	59
21606	2	eduardo	1	86
21624	2	juan	1	54
21803	1	Ana Maria Graseti	2	64
21812	2	Bacilotta Adrian	1	65
22004	2	Agustin	1	24
22013	2	Rocio	2	28
22016	2	Fernando	1	40
22211	2	Leandro	1	45
22214	2	Pablo	1	36
22225	2	Oscar	1	42
22411	1	Abigail	2	26
22416	1	Liliana	2	68
22803	1	Sergio	1	56
23001	2	Carina	2	48
23005	2	Josefina	2	46
23023	2	Joaquín	1	24
23203	2	damian	1	20
23214	2	lenka	2	40
23413	2	Vanesa	2	40
23422	2	Cinthia	2	26
23605	2	Elida	2	83
23614	2	Marta	2	86
24012	2	Cristina	2	52
24014	2	Fabian	1	34
24203	3	Christian	1	41
24212	4	Daniel	1	54
24401	4	Alan	1	33
24404	2	Nahuel	1	24
24406	2	Lidia	2	52
24413	2	Ariel	1	43
24602	2	Guillermo	1	31
32613	2	Alejandro	1	31
32615	3	Micaela	2	38
32805	5	Jaime Lazcano	1	44
32806	2	Mariana Pucci	2	36
32812	2	Juan Solis	1	36
33005	2	Natalio sanchez	1	42
33012	1	Carlos pellegrino	1	82
33023	2	Lourdes	2	29
33025	2	Noelia Merino	2	32
33203	2	Jose Dario Gomez	1	39
33211	2	Maximiliano  Port	1	45
33414	2	Marina	2	41
33606	1	Julieta	2	21
33805	2	Fernanda	2	32
33806	2	Yanina	2	44
34201	2	Alicia	2	52
34203	2	Sergio	1	50
34205	2	Sergio	1	44
34211	2	Miguel	1	63
34401	2	alfredo	1	56
34404	2	ofelia alvarez	2	94
34413	2	ariel muñoz	1	45
34414	2	diego	1	46
34415	3	ayme	2	23
34611	2	denis	2	23
34621	2	laura	2	42
34623	1	enrique	1	57
34625	1	Federico	1	48
34626	2	natividad	2	75
34801	2	romina alcalde	2	38
34806	2	juan carlos	1	71
34811	2	alejo	1	44
34813	2	valeria	2	48
35004	2	Felia	2	52
35204	2	javier bogao	1	63
35211	2	marcela	2	54
35215	2	franco carpelio	1	26
35225	2	Hijo	1	35
35403	2	lidia	2	66
35406	2	Mariela	2	49
35411	2	Ivan	1	61
35413	1	maria del mar	2	39
35601	2	Luis	1	55
35604	2	Alicia	2	66
35606	2	Leandro	1	44
35611	3	Mauro	1	32
35613	2	nilda	2	74
35806	2	Julieta Arias	2	38
35816	2	Javier Cordova	1	29
36002	2	Horacio cevallos	1	44
36013	2	Norma abalo	2	88
36202	2	Leonardo Cano	1	36
36404	2	Camila zaraza	2	25
36414	2	Elsa	2	64
36416	2	Facundo	1	23
36606	3	Fiama Pontoriero Gentile	2	18
36611	2	Natalia Diaz	2	38
36812	2	Ariel Gomez	1	30
37001	2	Fredy	1	30
37004	2	Cecilia	2	26
37006	2	Marcelo	1	55
37022	2	Evelin	2	45
37205	2	Juana gonzalez	2	70
37603	4	Maria	2	38
37612	3	Matias cano	1	20
37616	2	Pamela	2	18
38002	2	Usana	2	68
38005	4	Pablo	1	41
38012	2	Pablo	1	64
38206	2	Luis Quispe Qispe	1	20
38225	5	Ramiro	1	19
38603	1	Eduardo	1	60
38604	3	Aldana	2	19
38803	2	Andres	1	36
38804	2	Beatriz Rubinstein	2	60
38805	2	Matias Gallardo	1	31
38806	2	Ester	2	68
38811	1	Shosco Juan Carlos	1	43
38814	2	Marini Romina Nadia	2	33
39004	2	Mario Ramon Ojeda	1	74
39012	2	Evangelina Gerardusi	2	45
39202	1	horacio	1	60
39425	2	Juan	1	41
39601	1	Maria	2	54
39611	1	Maria	2	37
39613	2	Mariano	1	47
39814	2	Marisol	2	34
40001	2	carina	2	22
40002	2	laura	2	33
40012	2	elena venecia	2	82
40015	2	alejandro ayerde	1	61
40205	2	Nestor	1	55
40213	2	Leonardo	1	43
40216	2	Norberto	1	60
40413	2	Juan Carlos	1	65
40414	2	Perla	2	47
40416	2	Olga	2	56
40601	2	Eric	1	32
40606	2	Daniel	1	60
40611	2	Leonor	2	68
40623	4	Néstor	1	44
40812	2	Eleno Garrido	1	53
40815	2	Nestor Fabian Lapuente	1	57
40823	2	Mirta Gloria Fernandez	2	50
41004	1	Graciela bruno	2	41
41203	2	Jorge omar galleano	1	59
41211	2	Guido trenti sultani	1	35
41212	2	Juan carlos Profita	1	73
41214	2	Laura daiana ziraldo	2	33
41602	2	Luis	1	34
41621	2	Marta	2	72
41623	2	Abril	2	20
41625	3	Leonardo	1	20
41801	2	Hayde	2	75
41803	2	Marina	2	37
41806	2	Graciela	2	70
41813	4	Jorge	1	49
41815	2	Micaela	2	37
42003	2	Gabriela	2	45
42006	2	Paulino	1	58
42012	2	Hernan	1	26
42016	2	Julian	1	44
42025	2	Gabriela	2	51
42026	2	Camila	2	23
42401	1	Maria aide	2	77
42402	1	Carolina	2	48
42424	3	Fernando	1	39
42614	2	Lucas	1	33
42616	3	Emanuell	1	37
42624	2	Alejandro	1	47
42805	2	Celeste riquelme	2	40
42811	2	Nora macri	2	58
42814	2	Beatriz gonalez	2	75
42825	1	Maria luisa	2	59
43004	2	Estiben	1	25
43011	2	Marcelo fontana	1	54
43202	2	Victoria	2	36
43206	2	Gabriel	1	39
43611	2	Elsa Asuncion Frias	2	74
43801	2	Julian Bellavita	1	35
68002	3	Franco Emmanuel Espina	1	31
68005	2	Mendez Saul	1	35
68205	2	matias	1	40
68213	3	Tomas	1	25
68402	3	Maria Lara Cubilla Rojas	2	67
18012	3	Mónica Graciela Redote	2	58
12213	3	Maximiliano	1	33
14024	2	Darwin	1	27
27201	1	César	1	70
32021	3	Raul	1	43
46803	4	Solanch Amarilla	2	35
64026	7	Oscar gomez	1	23
10206	4	Martín	1	28
12211	2	Eduardo	1	61
13624	1	Cristina	2	60
19214	2	Karla	2	20
19402	4	zhilong yang	1	65
19412	3	rosana castro de meza	2	51
19612	3	Emanuel	1	28
25206	2	Karen	2	29
26006	3	Sergio	1	42
26204	2	Gutavo	1	58
26411	1	Natalia Orellana	2	20
27814	2	Jonatan	1	29
28204	4	Leo	1	32
29216	3	Chris	1	22
30401	4	Ariel	1	66
30425	4	Gabriel	1	22
31023	4	Ariani	2	65
31623	2	Noemi	2	59
45613	2	Natasha	2	25
46811	3	Magdalena Borrajo	2	22
49211	3	Sergio	1	51
49624	1	Micaela	2	23
63006	3	Ivor	1	25
63201	4	Noe	1	18
64024	2	Fernando pugliese	1	81
10223	3	Rocío	2	20
10425	4	Luis	1	65
10625	2	Silvia	2	50
10801	1	Ricardo	1	24
14025	2	Graciela salinas	2	50
18215	4	Gonzalo	1	20
18416	2	Paulo	1	39
18606	3	Romina	2	37
19006	2	mariano	1	46
19406	2	sandra chagas	2	56
20013	2	Daniela Pedraza	2	22
20206	3	Florencia Partenio	2	42
20221	1	Xuimar Campos	2	36
25003	2	Andrea	2	55
25026	3	Ivan	1	24
26414	1	Nestor Ariel Paratore	1	49
27612	3	Luisina	2	24
27801	2	Marina	2	40
29406	3	Agustin	1	32
29602	3	Yolimar	2	47
29611	2	Paula	2	39
29821	2	Matias	1	19
29823	2	Liliana	2	54
30012	3	Valentina	2	20
30201	3	Agostina	2	25
30422	2	Alicia	2	61
31012	1	Enzo	1	21
31411	2	Maria	2	57
31625	2	Nicolas	1	22
32024	3	Vanina	2	31
32201	3	Carmen	2	73
32412	2	Viviana	2	56
44021	3	Camila Rey	2	26
44403	3	Martín Vazquez	1	23
45014	3	Sebastian Rodriguez	1	19
45203	3	maria estela	2	75
45605	3	Susana	2	75
45625	3	Silvia	2	61
46012	5	Omar	1	71
46023	2	Marcela	2	42
46204	1	Horacio	1	57
46611	2	Susana	2	48
46814	3	Silvina Oschiro	2	35
47006	3	Sofia	2	18
47022	2	Adalberto	1	73
47211	2	Aracely	2	81
47411	2	Gabriela	2	52
48023	2	Mercedes	2	30
48804	2	Yanet	2	40
63212	3	Bruno	1	19
63401	2	Margarita	2	87
63824	3	Hijo1	1	20
64601	2	Claudia	2	55
64602	4	Francisco	1	23
64622	1	Juan	1	56
64825	3	Hija	2	37
65201	2	Felicitas	2	21
65614	3	Mateo	1	20
65816	2	Elena Cecilia	2	26
10004	1	gilberto	1	44
10202	2	Orfilia	2	75
10224	2	Marcelo	1	50
10405	2	Violeta	2	29
10406	2	Gustavo	1	58
10602	2	María Elena	2	51
10606	2	luciana	2	27
10612	2	Maria Alicia Ramilo	2	73
10615	2	Micaela	2	29
10811	1	Gerónimo	1	28
10814	2	Mariano	1	49
11002	2	Alejandra	2	36
11214	2	Felipe	1	25
11423	2	Micaela gamarra	2	21
11623	2	Rocio	2	26
11811	1	Carolina	2	43
12001	1	Miguel	1	78
12016	3	Roberto	1	61
12202	2	Luciano	1	39
12204	2	Grise	2	42
12216	1	Hernan	1	32
12402	1	sebastian	1	32
12403	2	gabriela	2	35
12603	1	Marcelo	1	56
12805	2	Rosana	2	53
12811	2	Tomas	1	21
13001	3	Samuel Ramos	1	23
13004	3	Celina bruña	2	20
13023	2	Gisela arce	2	30
13204	5	Gerardo	1	29
13224	2	Blanca	2	50
13402	2	Eugenia	2	27
13601	2	Ariel	1	36
13612	2	Gisel	2	35
13615	1	Roxana	2	30
13804	2	Cristian	1	48
13805	2	Franco gauchat	1	33
13814	2	Pamela buñay	2	24
13821	2	Sergio	1	45
13826	2	Perla hinkus	2	85
14022	1	Claudio	1	61
14023	2	Alejandro ramirez	1	27
14411	1	Edgar	1	63
18014	2	Eduardo de Augusto Figueiro	1	23
18025	2	Emilio	1	56
18221	1	Ruben	1	40
18401	2	Adolfo rineckki	1	46
18406	2	Juliana	2	19
18804	2	Maria	2	48
18815	2	Norma	2	54
18816	2	Julian	1	25
19003	4	Leticia	2	21
19206	2	richard	1	33
19223	2	Jorge	1	35
19224	2	irene	2	69
19416	2	sergio hernan despierre	1	43
19801	2	Gabriel	1	27
19804	2	Ofelia	2	90
19813	2	Ezequiel	1	37
20004	2	María Cecilia Lorenzo	2	41
20014	2	Nicolás Vande	1	35
20015	2	Elena Paucar Porras	2	29
24806	2	Milena Castro	2	26
25011	2	Hilario	1	47
25015	2	Matias	1	41
25016	2	Leticia	2	33
25203	2	isabel	2	42
25211	2	Sandra	2	41
25224	2	Maria	2	42
25403	2	Francisco	1	38
25413	2	Rita	2	63
25414	2	Marcelo	1	43
25415	2	Analia	2	38
25602	2	Marisa	2	43
25612	2	Marcela	2	40
25613	2	Renso	1	30
26016	1	Sebastian	1	46
26205	2	Juan Carlos	1	46
26206	4	Marcela	2	49
26211	2	Maria Zaida Elisa Garcia Brunelli	2	63
26225	2	Juan	1	22
26402	1	Ricardo Artipini	1	42
26406	1	Gloria Vera	2	38
26422	2	diego pamies	1	34
26614	2	Victoria	2	28
26805	1	Gustavo	1	61
27005	3	Guillermo	1	40
27011	2	Maximiliano Prestia	1	47
27013	2	Arcenio	2	40
27204	1	Marcia García	2	44
27206	2	Jose Marcos Videla	1	67
27213	2	Gustavo Alfredo Suarez	1	38
27215	2	Samuel Rodriguez	1	24
27606	2	Eliana	2	37
27622	3	Lucas	1	23
27822	2	Susana	2	64
28013	1	Lucas	1	42
28014	1	Fernando	1	49
28024	2	Jorgelina	2	35
28211	1	Mariana	2	48
28215	1	Jorge	1	35
28223	2	Lidia	2	71
28414	2	Alberto	1	70
28415	1	Facundo	1	28
28601	2	Pablo	1	34
28604	2	Tomas	1	26
28615	2	Patricio	1	22
28814	2	Libia	2	43
28823	5	Marcelo	1	44
29006	1	ian	1	33
29414	2	Leandro	1	33
29422	2	marcelo	1	44
29624	2	Silvia	2	50
29804	2	Silvina	2	52
29813	2	Valeria	2	40
29824	2	Tomas ignacio	1	28
30015	3	Gillermina	2	69
30022	2	Melisa	2	33
30203	2	Hernan	1	38
30224	2	Rosario	2	63
30404	2	Elva	2	92
30405	2	Hector	1	48
30412	2	Sigmund	1	76
30415	2	Irma	2	71
30802	2	Carla	2	23
30805	2	Juan	1	28
30823	3	Julio	1	33
30826	2	Daniela	2	55
31001	2	Marta	2	80
31016	2	Amalia	2	57
31022	2	Fabian	1	54
31214	1	Martin	2	38
31216	2	Federico	1	30
31226	2	Johanna	2	37
31402	2	Milvis	2	52
31413	2	Fernando	1	41
31425	2	Laura	2	41
31814	2	Maximiliano	1	35
32001	2	Carmen	2	83
32202	4	Rafael	1	44
32206	2	Martin	1	48
32211	6	Albert	1	38
32216	2	roberto	1	23
32414	1	Estela herrera	2	69
32416	2	Nidia	2	70
32426	2	Jorge	1	72
44002	2	Nelida	2	63
44005	2	Rosa	2	70
44006	2	Javier	1	45
44012	2	Diego Pablo	1	41
44204	2	Dolores	2	76
44211	2	Lourdes	2	31
44222	2	Gustavo	1	51
44226	2	Marcelo	1	46
44402	2	Alicia Citadini	2	72
44413	2	Nicolás	1	42
44414	2	Fernán	1	35
44424	2	Pablo	1	38
44425	2	Graciela	2	71
44602	2	Pablo	1	52
44625	2	Susana	2	75
44626	2	Luciana	2	43
44801	2	eduardo	1	60
44805	2	Lucas	1	22
44811	2	Sra	2	69
45003	2	Ariel Bankirer	1	50
45204	2	hernan	1	31
45205	2	pedro	1	25
45206	2	Cristian	1	34
45211	2	mercedez	2	82
45212	1	ana laura	2	21
45422	1	Osvaldo	1	63
45424	1	Daniel	1	63
45612	1	Cristina	2	40
45805	2	Leandro	1	42
45813	2	Sra	2	75
45815	3	Claudio	1	47
45821	2	Kim	2	40
46001	1	Rocio	2	28
46014	2	Micaela	2	29
46021	2	Martin	1	50
46203	2	Jorge	1	79
46214	1	Daniel	1	67
46406	2	Estela	2	72
46411	2	Cecilia	2	56
46413	2	Pablo	1	29
46423	1	Alberto	1	56
46615	2	Cristian	1	38
46625	2	Mariela	2	30
46815	2	Diana Bermudez Bonillq	2	52
47002	2	Leopoldo	1	38
47023	2	Antonio	1	74
47025	2	Hetnan	1	30
47212	1	Santiago	1	36
47214	1	Luisa	2	78
47223	1	Luis	1	34
47612	2	Adriana	2	45
47622	2	Julieta	2	36
47801	2	Matias	1	39
47805	2	Emanuel	1	25
47815	4	Ramon	1	56
47822	2	Alejandro	1	38
48004	1	Ignacio	1	35
48014	4	Matias	1	41
48015	1	Guadalupe	2	38
48026	2	Beatriz	2	58
48212	2	Nuria	2	33
48406	2	Jhonathan	1	23
48412	2	Javier	1	41
48606	3	Diego	1	43
48615	2	Cesar	1	34
48812	1	Oscar	1	81
48815	1	Maria	2	24
49001	1	Amelia	2	83
49005	2	Nicolas	1	33
49014	2	Gustavo	1	34
49202	2	Nicolas	1	26
49203	2	Lucas	1	30
49215	2	Matias	1	32
49402	2	Francisco	1	25
49601	2	Victoria	2	27
49613	1	Gabriela	2	52
63001	2	Rocio	2	24
63002	3	Roberto	1	63
63005	2	Carolina	2	36
63216	2	Valeria	2	34
63223	2	Claudia	2	49
63405	2	Antonio	1	68
63406	2	Blas	1	33
63414	2	Eliana	2	40
63423	2	Federico	1	46
63606	2	Lumi	2	46
63614	2	Jose	1	33
63615	2	Viky	2	38
63623	2	Rodolfo	1	72
63804	2	Pareja	1	44
64005	2	Claudia cozza	2	50
64013	4	Fernando angulo	1	31
64206	2	Ariel martinez	1	35
64223	2	Mauricio alvarez	1	45
64404	3	Rafael	1	34
64406	2	Paola	2	40
64613	2	Ester	2	73
64821	2	Daiana	2	30
65203	1	Hector acevedo	1	88
65204	1	Gustavo	1	45
65406	2	Lucas	1	35
65421	2	Roberto	1	62
65602	2	Roberto	1	85
65812	2	Maria	2	74
66001	1	teresa	2	65
66401	2	Romina	2	38
66423	2	Maria	2	36`

var a = datos.split(/\r?\n/)
    .map(linea=>linea.split(/\t/))
    .map(campos=>({enc:campos[0], p11b:campos[1], nombre:campos[2], sexo:campos[3], edad:campos[4]}));

var sqls = a.map(row=>`
insert into tem (enc, area, enc_original, cluster, tipo_domicilio, json_encuesta, carga_observaciones) values (${row.enc-0+150},${row.enc.substr(0,3)-0+1},${row.enc},4,6,'${
    JSON.stringify({g1:6, personas:[{p1:row.nombre, p2:row.sexo, p3:row.edad, p4:'1'}], p11:1, p12:row.nombre, cp:"1"})
}','persona seleccionada: ${row.nombre} (${row.sexo=='1'?'V':'M'}, ${row.edad})');`).join('\n');

fs.writeFile('local-cluster4.sql', sqls, 'utf8').catch(err=>{
    console.log(err);
})

