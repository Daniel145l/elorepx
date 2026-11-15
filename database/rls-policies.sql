select tablename, rowsecurity
from pg_tables where schemaname = 'public' order by tablename;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'public' order by tablename, cmd;

-- retorno
tablename,policyname,cmd,roles,qual,with_check
cientistas,leitura pública de cientistas,SELECT,{public},true,null
curiosidade_do_dia,leitura pública de curiosidade do dia,SELECT,{public},true,null
feedbacks,usuário insere o próprio feedback,INSERT,{public},null,((auth.uid() = user_id) OR (user_id IS NULL))
medalhas,leitura pública de medalhas,SELECT,{public},true,null
missoes,leitura pública de missões,SELECT,{public},true,null
niveis_olimpiada,leitura pública de níveis,SELECT,{public},true,null
olimpiadas,leitura pública de olimpíadas,SELECT,{public},true,null
profiles,usuário vê o próprio perfil,SELECT,{public},(auth.uid() = id),null
relatos_alunos,leitura pública de relatos,SELECT,{public},true,null
tentativas_resposta,usuário vê as próprias tentativas,SELECT,{public},(auth.uid() = user_id),null
usuario_medalhas,usuário vê as próprias medalhas,SELECT,{public},(auth.uid() = user_id),null
usuario_missoes,usuário vê o próprio progresso em missões,SELECT,{public},(auth.uid() = user_id),null