
create table usuario(
id_user serial primary key,
nome_user varchar(255) not null,
senha varchar(255) not null,
peso varchar(255) not null,
altura varchar(255) not null,
idade varchar(255) not null,
cargo varchar(255) default 1,
status varchar(255) default 'Ativo'
)

create table professor(
id_prof serial primary key,
nome_prof varchar(255) not null,
senha varchar(255) not null,
cargo varchar(255) default 2
)


create table treinos(
id_treino serial primary key,
nome_treino varchar(255) not null,
id_prof int references professor(id_prof),
id_user int references usuario(id_user),
data_criacao timestamp default now()
)

create table exercicios(
id_exercicio serial primary key,
id_treino int references treinos(id_treino) on delete cascade,
nome_exercicio varchar(255) not null,
series varchar(50) not null,
repeticoes varchar(50) not null,
observacoes varchar(1000)
)

create table execucoes(
id_execucao serial primary key,
id_exercicio int references exercicios(id_exercicio) on delete cascade,
id_user int references usuario(id_user),
data_execucao timestamp default now()
)