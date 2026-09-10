const userName = document.querySelector("h2")
const cargo = localStorage.getItem("cargo")
const name = localStorage.getItem("nome")
const meuId = localStorage.getItem("id")

if (!name) {
    userName.textContent = " Visitante"
} else if (cargo == 2) {
    userName.textContent = `Bem vindo professor: ${name}`
} else {
    userName.textContent = `Bem vindo aluno: ${name}`
}

const openButton = document.querySelector("#open")

if (cargo == 1) {
    openButton.style.display = "none"
}

const modal = document.querySelector("#modal")
const form = document.querySelector("form")
const listaExercicios = document.querySelector("#lista-exercicios")
const templateExercicio = document.querySelector("#template-exercicio")
const modalTitulo = document.querySelector("#modalTitulo")

let modoEdicao = false
let idEmEdicao = null

document.querySelector("#open").addEventListener('click', () => {
    const user = localStorage.getItem("nome")

    if (!user) {
        return window.location.href = "../Login/index.html"
    }
    modoEdicao = false
    idEmEdicao = null
    modalTitulo.textContent = "Adicionar ficha de treino"
    form.reset()
    document.querySelector("#id_usuario").disabled = false
    listaExercicios.innerHTML = ""
    adicionarLinhaExercicio()
    modal.showModal()
})
document.querySelector("#close").addEventListener('click', () => {
    modal.close()
})

document.querySelector("#add-exercicio").addEventListener('click', () => {
    adicionarLinhaExercicio()
})

function adicionarLinhaExercicio(exercicio) {
    const clone = templateExercicio.content.cloneNode(true)
    if (exercicio) {
        clone.querySelector(".ex-nome").value = exercicio.nome_exercicio || ""
        clone.querySelector(".ex-series").value = exercicio.series || ""
        clone.querySelector(".ex-repeticoes").value = exercicio.repeticoes || ""
        clone.querySelector(".ex-observacoes").value = exercicio.observacoes || ""
    }
    clone.querySelector(".remover-exercicio").addEventListener('click', (e) => {
        e.target.closest(".exercicio-row").remove()
    })
    listaExercicios.appendChild(clone)
}

function lerExercicios() {
    return Array.from(document.querySelectorAll(".exercicio-row")).map((row) => ({
        nome_exercicio: row.querySelector(".ex-nome").value,
        series: row.querySelector(".ex-series").value,
        repeticoes: row.querySelector(".ex-repeticoes").value,
        observacoes: row.querySelector(".ex-observacoes").value,
    })).filter((ex) => ex.nome_exercicio)
}

const corpo = document.querySelector("tbody")
const quantidade = document.querySelector("#nProdutos")

let total = 0;
if (total == 0) {
    quantidade.textContent = "Nenhuma ficha foi listada"
}

const api = "http://localhost:3000/"
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome_treino = document.querySelector("#treino").value;
    const id_user = document.querySelector("#id_usuario").value;
    const id_prof = localStorage.getItem("id")
    const exercicios = lerExercicios()

    if (!exercicios.length) {
        alert("Adicione ao menos um exercício")
        return
    }

    let resposta
    if (modoEdicao) {
        resposta = await fetch(`${api}editar/${idEmEdicao}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome_treino, exercicios }),
        });
    } else {
        resposta = await fetch(`${api}cad_treinos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome_treino, id_prof, id_user, exercicios }),
        });
    }

    if (resposta.status == 201) {
        alert(modoEdicao ? "Ficha atualizada" : "Ficha adicionada")
        window.location.reload()
    } else {
        alert("Erro");
    }
});

const disconnect = document.querySelector("#disconnect")
disconnect.addEventListener('click', () => {
    localStorage.clear()
    alert("System from disconnect..")
    window.location.replace("../Login/index.html")
})

const id_fabric = document.querySelector("#id_usuario")
let prods = [];

window.addEventListener("load", async () => {
    const resposta = await fetch(`${api}treinos/${cargo}/${meuId}`);
    const usuarios = await fetch(`${api}usuario`);

    prods = await resposta.json();
    const users = await usuarios.json();
    console.log(prods)

    id_fabric.innerHTML = `<option value="" disabled selected>Selecione o aluno</option>`;
    users.forEach((prod) => {
        id_fabric.innerHTML += `
      <option value="${prod.id_user}">${prod.nome_user}</option>
      `;
    })

    renderizar(prods);
});

function formatarData(data) {
    if (!data) return "Nunca registrado"
    return new Date(data).toLocaleString("pt-BR")
}

const fichasPorId = {}

function renderizar(prods) {
    prods.forEach((element) => {
        fichasPorId[element.id_treino] = element
        corpo.innerHTML += `     <tr>
                <td>${element.id_treino}</td>
                <td>${element.nome_user}</td>
                <td>${element.status || "-"}</td>
                <td>${element.nome_treino}</td>
                <td>${element.exercicios.length}</td>
                <td>${element.nome_prof}</td>
                <td>${formatarData(element.ultimo_treino)}</td>
                <td>
                <div id="buttonMove">
                ${cargo != 1 ? `<button id="deletar" onclick="deletar(${element.id_treino})">🗑️</button>` : '<div></div>'}
                ${cargo != 1 ? `<button id="editar" onclick="editar(${element.id_treino})">✏️</button>` : '<div></div>'}                
                <button id="ficha" onclick="ficha(${element.id_treino})">🗃️</button>
                </div>
                </td>
            </tr>`;
        total++;
        quantidade.textContent = "Total de fichas: " + total;
    });
}

async function ficha(id_treino) {
    const element = fichasPorId[id_treino]
    const closeDetalhes = document.querySelector("#closeDetalhes")
    closeDetalhes.addEventListener('click', () => {
        const modalDetalhes = document.querySelector("#DetalhesModal")
        modalDetalhes.close()
    })
    const usuario = await fetch(`${api}usuario_especif/${element.id_user}`);
    const user = await usuario.json();
    const modalDetalhes = document.querySelector("#DetalhesModal")
    const Nome_aluno = document.querySelector("#Nome_aluno")
    const Detalhes_peso = document.querySelector("#Detalhes_peso")
    const Detalhes_altura = document.querySelector("#Detalhes_altura")
    const Detalhes_idade = document.querySelector("#Detalhes_idade")
    const Detalhes_status = document.querySelector("#Detalhes_status")
    const Detalhes_ultimo = document.querySelector("#Detalhes_ultimo")
    const Detalhes_exercicios = document.querySelector("#Detalhes_exercicios")

    Nome_aluno.textContent = `${element.nome_treino} — ${user.nome_user}`
    Nome_aluno.style.fontSize = "20px"
    Detalhes_peso.textContent = `${user.peso} kg`
    Detalhes_altura.textContent = `${user.altura} m`
    Detalhes_idade.textContent = `${user.idade}`
    Detalhes_status.textContent = `${user.status || "-"}`
    Detalhes_ultimo.textContent = formatarData(element.ultimo_treino)

    const souEsteAluno = cargo == 1 && String(meuId) == String(element.id_user)

    Detalhes_exercicios.innerHTML = `<span class="section-label">EXERCÍCIOS</span>`
    element.exercicios.forEach((ex) => {
        Detalhes_exercicios.innerHTML += `
            <div class="exercicio-item">
                <div class="exercicio-info">
                    <p class="exercicio-nome">${ex.nome_exercicio} ${ex.concluido ? "✅" : ""}</p>
                    <small>${ex.series} séries x ${ex.repeticoes} repetições</small>
                    ${ex.observacoes ? `<small class="obs">${ex.observacoes}</small>` : ""}
                </div>
                ${souEsteAluno
                ? `<button type="button" class="btn-concluir" ${ex.concluido ? "disabled" : ""} onclick="registrarExecucao(${ex.id_exercicio}, this)">${ex.concluido ? "Concluído" : "Marcar como feito"}</button>`
                : ""}
            </div>
        `
    })

    modalDetalhes.showModal()
}

async function registrarExecucao(id_exercicio, botao) {
    const resposta = await fetch(`${api}registrar_execucao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_exercicio, id_user: meuId }),
    });
    if (resposta.status == 201) {
        botao.textContent = "Concluído"
        botao.disabled = true
        botao.parentElement.querySelector(".exercicio-nome").innerHTML += " ✅"
    } else {
        alert("Erro ao registrar exercício")
    }
}

async function deletar(id) {
    const resposta = await fetch(`${api}deleta/${id}`, {
        method: "DELETE",
    });
    if (resposta.status == 200) {
        return window.location.reload();
    }
    return alert("erro ao deletar");
}

async function editar(id) {
    const produto = await fetch(`${api}treinos_especif/${id}`);
    const prod = await produto.json();

    modoEdicao = true
    idEmEdicao = id
    modalTitulo.textContent = "Editar ficha de treino"
    form.reset()
    document.querySelector("#treino").value = prod.nome_treino
    document.querySelector("#id_usuario").value = prod.id_user
    document.querySelector("#id_usuario").disabled = true

    listaExercicios.innerHTML = ""
    if (prod.exercicios.length) {
        prod.exercicios.forEach((ex) => adicionarLinhaExercicio(ex))
    } else {
        adicionarLinhaExercicio()
    }

    modal.showModal()
}
