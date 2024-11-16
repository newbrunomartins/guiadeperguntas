const express = require("express");
const app = express();
const connection = require("./database/database");
const Pergunta = require("./database/pergunta");
const Resposta = require("./database/resposta");

//Conexão com Database
connection
  .authenticate()
  .then(() => {
    console.log("CONECTADO AO DB!");
  })
  .catch((msgErro) => {
    console.log("ERRO AO CONECTAR!");
  });

//Informa que deve ser utilizado o EJS para renderizar o HTML
app.set("view engine", "ejs");
//Permite usar arquivos estáticos no EJS
app.use(express.static("public"));
//Recebe dados do formulário via POST
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  Pergunta.findAll({
    raw: true,
    order: [
      //RAW traz apenas os dados BRUTOS e ORDER, ORDENA a visualização
      ["id", "desc"],
    ],
  }).then((perguntas) => {
    res.render("index", {
      perguntas: perguntas, //Criando uma variavel v+perguntas para receber os dados
    });
  });
});
app.get("/perguntar", (req, res) => {
  res.render("perguntar");
});
app.post("/salvarpergunta", (req, res) => {
  //recebe os dados do formulário
  var titulo = req.body.titulo;
  var descricao = req.body.descricao;

  //Salva os dados no Banco
  Pergunta.create({
    titulo: titulo,
    descricao: descricao,
  }).then(() => {
    res.redirect("/"); //Redireciona para uma página. Nesse caso, a home.
  });
});
app.get("/pergunta/:id", (req, res) => {
  var id = req.params.id;
  Pergunta.findOne({
    where: { id: id },
  }).then((pergunta) => {
    if (pergunta != undefined) {
      //Pergunta encontrada

      Resposta.findAll({
        where: { perguntaId: pergunta.id },
        order: [["id", "DESC"]],
      }).then((respostas) => {
        res.render("pergunta", {
          pergunta: pergunta,
          respostas: respostas,
        });
      });
    } else {
      //Pergunta não encontrada
      res.redirect("/");
    }
  });
});
app.post("/responder", (req, res) => {
  var corpo = req.body.corpo;
  var perguntaId = req.body.pergunta;
  Resposta.create({
    corpo: corpo,
    perguntaId: perguntaId,
  }).then(() => {
    res.redirect("/pergunta/" + perguntaId);
  });
});
app.listen(8000, () => {
  console.log("We are Online Houston!");
});
