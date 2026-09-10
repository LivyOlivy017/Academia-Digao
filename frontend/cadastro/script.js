 const api = "http://localhost:3000/"
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.querySelector("#senha").value;
    const user = document.querySelector("#nome").value;
    const weight = document.querySelector("#peso").value;
    const height = document.querySelector("#altura").value;
    const years = document.querySelector("#idade").value;
    const resposta = await fetch(`${api}cadastro`, {

        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user,
            password,
            weight,
            height,
            years
        })
    })
    if (resposta.status === 201) {
        alert("Cadastrado com sucesso");
        window.location.replace("../Login/index.html");
    } else {
        alert("Cadastro inválido! Ou Email já cadastrado");


    }
})