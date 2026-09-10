const api = "http://localhost:3000/"
const form = document.querySelector("form")
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = document.querySelector("#nome").value
  const password = document.querySelector("#senha").value

  const resposta = await fetch(`${api}login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user,
      password
    }),
  });
if (resposta.status == 200) {
    const usuarios = await resposta.json();

    console.log(usuarios);

    localStorage.setItem('id', usuarios.id_user);
    localStorage.setItem('nome', usuarios.nome_user);
    localStorage.setItem('cargo', usuarios.cargo);

    window.location.href = "../PaginaInicial/index.html";
} else {
   return alert("Usuario ou senha incorretos");
}

});

