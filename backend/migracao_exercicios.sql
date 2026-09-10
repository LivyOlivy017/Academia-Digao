-- Script de MIGRAÇÃO para quem já tinha o banco criado com a estrutura antiga
-- (treinos com exercicio/repeticao/duracao direto na tabela).
-- Rode isso uma vez no seu banco existente.

-- 1. cria a nova tabela de exercícios
create table if not exists exercicios(
id_exercicio serial primary key,
id_treino int references treinos(id_treino) on delete cascade,
nome_exercicio varchar(255) not null,
series varchar(50) not null,
repeticoes varchar(50) not null,
observacoes varchar(1000)
)

-- 2. cria a tabela de execuções (registro do aluno)
create table if not exists execucoes(
id_execucao serial primary key,
id_exercicio int references exercicios(id_exercicio) on delete cascade,
id_user int references usuario(id_user),
data_execucao timestamp default now()
)

-- 3. migra os dados que já existiam em treinos.exercicio para a nova tabela exercicios
insert into exercicios (id_treino, nome_exercicio, series, repeticoes, observacoes)
select id_treino, exercicio, duracao, repeticao, null
from treinos

-- 4. remove as colunas antigas que agora vivem em exercicios
alter table treinos drop column if exists exercicio
alter table treinos drop column if exists repeticao
alter table treinos drop column if exists duracao

-- 5. adiciona a data de criação da ficha
alter table treinos add column if not exists data_criacao timestamp default now()

-- 6. garante que usuario tem um status (usado para "aluno ativo")
alter table usuario alter column status set default 'Ativo'
update usuario set status = 'Ativo' where status is null
