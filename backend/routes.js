import express from "express";
import sql from "./database.js";
const routes = express.Router();

//USUÁRIO
routes.post("/login", async (req, res) => {
  try {
    const { user, password } = req.body;

    const usuario = await sql`select * from usuario where nome_user = ${user}`;
    if (usuario.length && password == usuario[0].senha) {
      return res.status(200).json(usuario[0]);
    }

    const professor = await sql`select * from professor where nome_prof = ${user}`;
    if (professor.length && password == professor[0].senha) {
      return res.status(200).json({
        id_user: professor[0].id_prof,
        nome_user: professor[0].nome_prof,
        cargo: professor[0].cargo
      });
    }

    return res.status(401).json("erro ao logar");
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
});

routes.get("/usuario", async (req, res) => {
  const resposta = await sql`select * from usuario`;
  return res.status(200).json(resposta);
});

routes.get("/usuario_especif/:id", async (req, res) => {
  const { id } = req.params;
  const resposta = await sql`select * from usuario where id_user= ${id}`;
  return res.status(200).json(resposta[0]);
});

routes.post("/cadastro", async (req, res) => {
  try {
    const { user, password, weight, height, years } = req.body;
    console.log(user, password, weight, height, years)
    await sql`INSERT INTO usuario(nome_user, senha, peso, altura, idade, status) VALUES (${user},${password},${weight},${height},${years},'Ativo')`;
    return res.status(201).json();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro interno ao cadastrar usuário",
    });
  }
});
routes.delete("/deletar/:id", async (req, res) => {
  const { id } = req.params;
  await sql`delete from usuario where id_user = ${id}`;
  return res.status(200).json("Deletado");
});
routes.put("/editarUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, status } = req.body;
    const resposta = await sql`UPDATE usuario
	SET nome_user = COALESCE(${nome ?? null}, nome_user),
	    status = COALESCE(${status ?? null}, status)
	WHERE id_user=${id} RETURNING *;`;
    return res.status(200).json(resposta[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao editar Usuario" });
  }
});

// Status geral dos alunos: quem está ativo/inativo e quando foi o
// último treino (exercício) realizado por cada um.
routes.get("/alunos_status", async (req, res) => {
  try {
    const resposta = await sql`
      SELECT u.id_user, u.nome_user, u.status,
             MAX(e.data_execucao) AS ultimo_treino
      FROM usuario u
      LEFT JOIN execucoes e ON e.id_user = u.id_user
      GROUP BY u.id_user, u.nome_user, u.status
      ORDER BY u.nome_user
    `;
    return res.status(200).json(resposta);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao buscar status dos alunos" });
  }
});

//Treinos (fichas com vários exercícios)
routes.get("/treinos/:cargo/:id_user", async (req, res) => {
  try {
    const { cargo, id_user } = req.params;

    let fichas;
    if (cargo == 2) {
      fichas = await sql`
        SELECT t.id_treino, t.nome_treino, t.data_criacao,
               u.id_user, u.nome_user, u.status,
               p.id_prof, p.nome_prof
        FROM treinos t
        JOIN usuario u ON t.id_user = u.id_user
        JOIN professor p ON t.id_prof = p.id_prof
        ORDER BY t.id_treino DESC
      `;
    } else {
      fichas = await sql`
        SELECT t.id_treino, t.nome_treino, t.data_criacao,
               u.id_user, u.nome_user, u.status,
               p.id_prof, p.nome_prof
        FROM treinos t
        JOIN usuario u ON t.id_user = u.id_user
        JOIN professor p ON t.id_prof = p.id_prof
        WHERE t.id_user = ${id_user}
        ORDER BY t.id_treino DESC
      `;
    }

    const idsTreino = fichas.map((f) => f.id_treino);

    let exercicios = [];
    if (idsTreino.length) {
      exercicios = await sql`
        SELECT id_exercicio, id_treino, nome_exercicio, series, repeticoes, observacoes
        FROM exercicios
        WHERE id_treino IN ${sql(idsTreino)}
        ORDER BY id_exercicio
      `;
    }

    let execucoes = [];
    const idsExercicio = exercicios.map((e) => e.id_exercicio);
    if (idsExercicio.length) {
      execucoes = await sql`
        SELECT id_exercicio, id_user, MAX(data_execucao) AS data_execucao
        FROM execucoes
        WHERE id_exercicio IN ${sql(idsExercicio)}
        GROUP BY id_exercicio, id_user
      `;
    }

    const rows = fichas.map((f) => {
      const exs = exercicios
        .filter((e) => e.id_treino === f.id_treino)
        .map((e) => {
          const exec = execucoes.find(
            (x) => x.id_exercicio === e.id_exercicio && x.id_user === f.id_user
          );
          return { ...e, concluido: !!exec, data_execucao: exec ? exec.data_execucao : null };
        });

      const ultimoTreino = exs
        .map((e) => e.data_execucao)
        .filter(Boolean)
        .sort()
        .pop() || null;

      return { ...f, exercicios: exs, ultimo_treino: ultimoTreino };
    });

    return res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao buscar treinos" });
  }
});

routes.get("/treinos_especif/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const treino = await sql`select * from treinos where id_treino=${id}`;
    if (!treino.length) return res.status(404).json({ error: "Treino não encontrado" });
    const exercicios = await sql`select * from exercicios where id_treino=${id} order by id_exercicio`;
    return res.status(200).json({ ...treino[0], exercicios });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro ao buscar ficha" });
  }
});

routes.get("/professor", async (req, res) => {
  const resposta = await sql`select * from professor`;
  return res.status(200).json(resposta[0]);
});

routes.post("/cad_treinos", async (req, res) => {
  try {
    const { nome_treino, id_prof, id_user, exercicios } = req.body;
    console.log(req.body)

    const treino = await sql`
      INSERT INTO treinos(nome_treino, id_prof, id_user)
      VALUES (${nome_treino}, ${id_prof}, ${id_user})
      RETURNING *
    `;
    const id_treino = treino[0].id_treino;

    const exerciciosSalvos = [];
    if (Array.isArray(exercicios)) {
      for (const ex of exercicios) {
        if (!ex.nome_exercicio) continue;
        const resposta = await sql`
          INSERT INTO exercicios(id_treino, nome_exercicio, series, repeticoes, observacoes)
          VALUES (${id_treino}, ${ex.nome_exercicio}, ${ex.series}, ${ex.repeticoes}, ${ex.observacoes || null})
          RETURNING *
        `;
        exerciciosSalvos.push(resposta[0]);
      }
    }

    return res.status(201).json({ ...treino[0], exercicios: exerciciosSalvos });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro interno ao adicionar treino",
    });
  }
});

routes.delete("/deleta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM treinos WHERE id_treino = ${id}`;
    return res.status(200).json({ message: "treino deletado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao deletar treino" });
  }
});

routes.put("/editar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_treino, exercicios } = req.body;
    console.log(req.params)

    const resposta =
      await sql`update treinos set nome_treino = ${nome_treino} where id_treino= ${id} RETURNING *`;

    const exerciciosAtualizados = [];
    if (Array.isArray(exercicios)) {
      await sql`DELETE FROM exercicios WHERE id_treino = ${id}`;
      for (const ex of exercicios) {
        if (!ex.nome_exercicio) continue;
        const r = await sql`
          INSERT INTO exercicios(id_treino, nome_exercicio, series, repeticoes, observacoes)
          VALUES (${id}, ${ex.nome_exercicio}, ${ex.series}, ${ex.repeticoes}, ${ex.observacoes || null})
          RETURNING *
        `;
        exerciciosAtualizados.push(r[0]);
      }
    }

    return res.status(201).json({ ...resposta[0], exercicios: exerciciosAtualizados });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao editar treino" });
  }
});

// Aluno registra que realizou um exercício da sua ficha (acesso pelo celular)
routes.post("/registrar_execucao", async (req, res) => {
  try {
    const { id_exercicio, id_user } = req.body;
    const resposta = await sql`
      INSERT INTO execucoes(id_exercicio, id_user)
      VALUES (${id_exercicio}, ${id_user})
      RETURNING *
    `;
    return res.status(201).json(resposta[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar execução" });
  }
});

export default routes;
