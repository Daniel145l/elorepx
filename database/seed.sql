insert into public.cientistas (nome, biografia, fonte_url, fonte_licenca) values
('Marie Curie', 'Marie Skłodowska-Curie nasceu em Varsóvia no dia 7 de novembro de 1867. Aos 24 anos foi para Paris e lá obteve sua graduação em Física na Universidade de Paris.

Ela fez importantes desenvolvimentos na teoria da radioatividade, descobrindo dois elementos químicos: o polônio e o rádio. Ela também fundou o Instituto Curie em Paris e sua contraparte em Varsóvia. Além disso, durante a Primeira Guerra Mundial, ajudou no desenvolvimento de unidades de radiografia móvel para serviços de raio-X.

Como prêmios, Curie foi a primeira mulher a ganhar o Prêmio Nobel, e a primeira pessoa a ganhar o prêmio em dois campos científicos diferentes (a física e química). Marie também foi a primeira mulher a se tornar professora da Universidade de Paris.

Os efeitos da radiação não eram bem conhecidos na época que Curie desenvolvia seus trabalhos, portanto, ela os realizava sem medidas protetivas adequadas. A radiação acabou causando doenças crônicas e, por fim, levou a sua morte em 1934.

Os trabalhos feitos por Marie Curie marcaram época e são lembrados até hoje, tendo uma importância fundamental no campo da radioatividade.', 'https://pt.wikipedia.org/wiki/Marie_Curie', 'CC BY-SA 4.0'),
('Albert Einstein', 'Albert Einstein nasceu em Ulm no dia 14 de março de 1879. Mudou-se para a Suíça quando jovem para dar início aos seus estudos na Escola Politécnica de Zurique. Trabalhava no escritório de patentes suíço enquanto começava seu doutorado na Universidade de Zurique.

Einstein publicou diversos artigos ainda em 1905, entre suas pesquisas estava o desenvolvimento da Teoria da Relatividade Especial. Também interessou-se pela mecânica estatística e teoria quântica. Além disso, ele estudou as propriedades térmicas da luz, que viria a gerar sua base para a lei do efeito fotoelétrico.

Ele recebeu o Prêmio Nobel em 1921 por todas as contribuições no campo da Física Teórica, com destaque para a descoberta da lei do efeito fotoelétrico. Ficou conhecido popularmente por uma de suas fórmulas mais famosas: E = mc² (equivalência massa-energia).

Foi descoberto um aneurisma na aorta abdominal de Einstein. Eram escassas as opções de tratamento, ele faleceu em 1955. Seu cérebro foi removido para preservação.

Suas contribuições são longas. Destacam-se trabalhos no campo da relatividade e princípio da equivalência e na mecânica quântica. Foram mais 300 trabalhos científicos publicados e mais de 150 obras não científicas.', 'https://pt.wikipedia.org/wiki/Albert_Einstein', 'CC BY-SA 4.0'),
('Isaac Newton', 'Sir Isaac Newton nasceu no condado de Lincolnshire no dia 4 de janeiro de 1643. Ingressou no Trinity College, Cambridge, onde conseguiu seu diploma de bacharel e também de mestrado.

Ainda nesse período, Newton complementou os ensinamentos da faculdade com ideias de filósofos modernos como Descartes e cientistas como Galileu e Thomas Street, onde conheceu mais sobre as pesquisas de Kepler.

Posteriormente, ele viria a se tornar ainda mais reconhecido pelo seu livro "Princípios Matemáticos da Filosofia Natural", que lançava as bases da Mecânica Clássica, formulando as leis do movimento e da gravitação universal. Além disso, ele fez contribuições para o campo da óptica e do cálculo infinitesimal, tornando-se um dos cientistas mais influentes de todos os tempos.

Isaac Newton faleceu dormindo em Londres no ano de 1727. Perícias após sua morte encontraram traços de mercúrio em seu cabelo, podendo evidenciar exposição à metais pesados durante a alquimia.

Newton é celebrado pelas suas contribuições em campos diversos da ciência: matemática, física, astronomia dentre outras. O matemático Joseph-Louis Lagrange disse que Newton foi o maior gênio que já viveu. Ele é considerado figura-chave na Revolução Científica.', 'https://pt.wikipedia.org/wiki/Isaac_Newton', 'CC BY-SA 4.0');

insert into public.olimpiadas (nome, descricao, site_oficial, data_inscricao_inicio, data_inscricao_fim, data_prova) values
('OBA', 'Olimpíada Brasileira de Astronomia e Astronáutica', 'https://oba.org.br', '2026-03-01', '2026-05-01', '2026-05-10'),
('OBFEP', 'Olimpíada Brasileira de Física das Escolas Públicas', 'https://www1.fisica.org.br/~obfep/', '2026-03-14', '2026-06-01', '2026-08-12'),
('OBQ', 'Olimpíada Brasileira de Química', 'https://obquimica.org/olimpiada/olimpiada-brasileira-de-quimica', NULL, NULL, '2026-08-28'),
('ONC', 'Olimpíada Nacional de Ciências', 'https://www.onciencias.org/', '2026-04-01', '2026-08-24', '2026-08-27');

insert into public.relatos_alunos (titulo, texto, fonte_url, fonte_nome) values
(
  'Artur Avila — da Olimpíada Internacional de Matemática à Medalha Fields',
  $$Carioca, Artur Avila começou a se destacar em matemática ainda na adolescência, conquistando medalhas na Olimpíada Brasileira de Matemática antes dos 16 anos. Em 1995, ganhou ouro na Olimpíada Internacional de Matemática, disputada no Canadá — resultado que o aproximou do IMPA, onde começou a cursar disciplinas de mestrado ainda como adolescente. Anos depois, conciliando pesquisa entre o Brasil e a Europa, tornou-se o primeiro sul-americano a receber a Medalha Fields, a mais alta honraria da matemática mundial, em 2014. Ele costuma frisar que sua trajetória mostra ser possível construir carreira científica de ponta a partir da formação brasileira, mesmo com as dificuldades estruturais do país. Hoje segue ativo em pesquisa e também participa de ações de divulgação científica, incluindo visitas a escolas e entrega de medalhas na própria OBMEP.$$,
  'https://impa.br/notices/as-olimpiadas-de-matematica-me-levaram-ate-o-impa-diz-artur-avila/',
  'IMPA'
),
(
  'Carlos Gustavo Moreira ("Gugu") — do IMPA aos 14 anos ao Prêmio Erdös',
  $$Carlos Gustavo Tamm de Araújo Moreira, conhecido como Gugu, começou a frequentar o IMPA aos 14 anos, conciliando o ensino médio regular com aulas de nível superior. Aos 16 anos, conquistou medalha de bronze na Olimpíada Internacional de Matemática (1989) e, no ano seguinte, medalha de ouro na mesma competição. Defendeu seu mestrado antes de completar 17 anos e se tornou doutor aos 20. Hoje é pesquisador titular do IMPA e coordenador-geral da Olimpíada Brasileira de Matemática (OBM), tendo recebido em 2018 o Prêmio Paul Erdös — a mais importante honraria mundial para quem contribui com a matemática olímpica, sendo o primeiro brasileiro a recebê-la. Ele costuma dizer que o papel das olimpíadas vai além da competição: é mostrar ao público que pesquisa em matemática é uma ciência viva, cheia de descobertas ainda por vir.$$,
  'https://www.obm.org.br/2018/05/07/prof-carlos-gustavo-moreira-gugu-ganha-premio-erdos-por-contribuicao-a-matematica/',
  'OBM'
),
(
  'Victor Almeida Ivo — do Colégio Farias Brito (Fortaleza) ao ouro na IPhO e a Oxford',
  $$Estudante do Colégio Farias Brito, em Fortaleza, Victor Almeida Ivo começou a se preparar para olimpíadas de física ainda no nono ano. Depois de passar por resultados intermediários na Olimpíada Brasileira de Física, conquistou, em 2017, a medalha de ouro na 48ª Olimpíada Internacional de Física (IPhO), realizada na Indonésia — a primeira conquista do tipo para o Ceará e parte do melhor resultado da história do Brasil na competição (5 medalhas, sendo 3 de ouro). No ano seguinte, tornou-se o único brasileiro aprovado para estudar Física na Universidade de Oxford, uma das mais tradicionais do mundo. Ao comentar sua trajetória, destacou que o primeiro passo é sempre tentar, e que a satisfação não deveria vir só das medalhas, mas de cada etapa de estudo cumprida. É um exemplo direto de que resultados internacionais também nascem fora do eixo Rio–São Paulo.$$,
  'https://www.opovo.com.br/noticias/fortaleza/2017/07/cearense-conquista-ouro-em-olimpiada-internacional-de-fisica.html',
  'O Povo'
);

insert into public.missoes (titulo, descricao, meta) values
('Missão de Astronomia', 'Resolver 5 questões de Astronomia', '{"quantidade": 5}'::jsonb);