const HASH_MESTRE =
"353232316f746e656d6172636173";

function converterParaHex(texto){

    let resultado = "";

    for(let i = 0; i < texto.length; i++){

        resultado +=
        texto.charCodeAt(i)
        .toString(16);

    }

    return resultado;

}

// ===== MESTRE =====

const botaoEntrarMestre =
document.getElementById("botaoEntrarMestre");


if(botaoEntrarMestre){

    botaoEntrarMestre.addEventListener("click", () => {

        const senhaInput =
        document.getElementById("senhaMestre");

        const erro =
        document.getElementById("erroSenhaMestre");


        erro.innerHTML = "";

        senhaInput.classList.remove(
            "erroInput"
        );


        if(

    converterParaHex(
        senhaInput.value
    )

    !==

    HASH_MESTRE

)
{

            senhaInput.classList.add(
                "erroInput"
            );

            erro.innerHTML =
            "Senha incorreta.";

            return;

        }


        localStorage.setItem(
            "ehMestre",
            "sim"
        );
        
        localStorage.setItem(
            "nomeMestre",
            "Mestre"
        );


        window.location.href =
        "salaMestre.html";

    });

}




// ===== JOGADOR =====

const botaoEntrar =
document.getElementById("botaoEntrar");


if(botaoEntrar){

    botaoEntrar.addEventListener("click", () => {

        const nomeInput =
        document.getElementById("nomeJogador");

        const erro =
        document.getElementById("erroNomeJogador");


        erro.innerHTML = "";

        nomeInput.classList.remove(
            "erroInput"
        );


        if(nomeInput.value.trim() === ""){

            nomeInput.classList.add(
                "erroInput"
            );

            erro.innerHTML =
            "Obrigatório";

            return;

        }


        localStorage.setItem(
            "nomeJogador",
            nomeInput.value
        );


        window.location.href =
        "salaJogador.html";

    });

}

const botaoMostrarSenha =
document.getElementById(
    "botaoMostrarSenha"
);

const senhaMestre =
document.getElementById(
    "senhaMestre"
);


if(botaoMostrarSenha){

    botaoMostrarSenha
    .addEventListener("click", () => {

        if(
            senhaMestre.type ===
            "password"
        ){

            senhaMestre.type = "text";

            botaoMostrarSenha.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

        }

        else{

            senhaMestre.type = "password";

            botaoMostrarSenha.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

        }

    });

}