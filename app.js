const $ = id => document.getElementById(id);

function lerFormulario() {
  const marcado = nome => document.querySelector(`input[name="${nome}"]:checked`).value;
  return {
    groupId: $("groupId").value.trim(),
    artifactId: $("artifactId").value.trim(),
    versao: $("versao").value.trim(),
    descricao: $("descricao").value.trim(),
    pacote: $("pacote").value.trim(),
    java: Number(marcado("java")),
    war: marcado("empacotamento") === "war",
  };
}

function validar(p) {
  if (!/^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$/.test(p.groupId))
    return "Group ID inválido. Exemplo: com.exemplo";
  if (!/^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(p.artifactId))
    return "Artifact ID inválido. Use letras, números, ponto, hífen ou sublinhado.";
  if (!/^[A-Za-z0-9_.-]+$/.test(p.versao)) return "Versão inválida. Exemplo: 1.0.0-SNAPSHOT";
  const partes = p.pacote.split(".");
  if (!/^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/.test(p.pacote) || partes.some(x => RESERVADAS.has(x)))
    return "Pacote inválido. Use minúsculas separadas por ponto, sem palavras reservadas do Java. Exemplo: com.exemplo.app";
  return "";
}

const RESERVADAS = new Set(("abstract assert boolean break byte case catch char class const continue default do double " +
  "else enum extends final finally float for goto if implements import instanceof int interface long native new " +
  "package private protected public return short static strictfp super switch synchronized this throw throws " +
  "transient try void volatile while true false null var record yield sealed permits").split(" "));

// Sugere o pacote a partir de groupId + artifactId: cada parte vira um identificador Java válido.
function sugerirPacote(groupId, artifactId) {
  return [...groupId.split("."), artifactId]
    .map(parte => parte.toLowerCase().replace(/[^a-z0-9_]/g, ""))
    .filter(Boolean)
    .map(parte => (/^[0-9]/.test(parte) ? "_" : "") + parte + (RESERVADAS.has(parte) ? "_" : ""))
    .join(".");
}

const escaparXml = t => t.replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

function gerarPom(p) {
  // O Java 8 não aceita a propriedade "release" em um JDK 8.
  const compilador = p.java < 11
    ? `    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>`
    : `    <maven.compiler.release>${p.java}</maven.compiler.release>`;

  // JAR: o manifest aponta a classe principal, para rodar com "java -jar".
  // WAR: sem web.xml (Servlet 3+), então desliga a exigência do arquivo.
  const empacotador = p.war ? `      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
        <configuration>
          <failOnMissingWebXml>false</failOnMissingWebXml>
        </configuration>
      </plugin>` : `      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <version>3.4.2</version>
        <configuration>
          <archive>
            <manifest>
              <mainClass>${p.pacote}.App</mainClass>
            </manifest>
          </archive>
        </configuration>
      </plugin>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>${p.groupId}</groupId>
  <artifactId>${p.artifactId}</artifactId>
  <version>${p.versao}</version>
  <packaging>${p.war ? "war" : "jar"}</packaging>

  <name>${p.artifactId}</name>
  <description>${escaparXml(p.descricao)}</description>

  <properties>
${compilador}
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>5.13.4</junit.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>\${junit.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.14.0</version>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.3</version>
      </plugin>
${empacotador}
    </plugins>
  </build>
</project>
`;
}

// Código-fonte compatível com Java 8 (sem var, sem text blocks), para servir a todas as versões.
function gerarApp(p) {
  return `package ${p.pacote};

public class App {

    public static String saudacao(String nome) {
        return "Olá, " + nome + "!";
    }

    public static void main(String[] args) {
        System.out.println(saudacao("Maven"));
    }
}
`;
}

function gerarTeste(p) {
  return `package ${p.pacote};

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class AppTest {

    @Test
    void saudacaoIncluiONome() {
        assertEquals("Olá, Maven!", App.saudacao("Maven"));
    }
}
`;
}

const GITIGNORE = `target/

# IntelliJ IDEA
.idea/
*.iml

# Eclipse
.classpath
.project
.settings/

# VS Code
.vscode/

# Sistema
.DS_Store
Thumbs.db
`;

function gerarReadme(p) {
  const rodar = p.war
    ? `O pacote gerado fica em \`target/${p.artifactId}-${p.versao}.war\`. Para rodar, publique esse arquivo em um servidor como o Tomcat.`
    : `Para rodar:

\`\`\`
java -jar target/${p.artifactId}-${p.versao}.jar
\`\`\``;
  return `# ${p.artifactId}

${p.descricao}

## Requisitos

- JDK ${p.java < 11 ? "8" : p.java} ou superior
- Maven 3.9 ou superior

## Comandos

\`\`\`
mvn test      # roda os testes
mvn package   # compila, testa e gera o ${p.war ? "WAR" : "JAR"} em target/
\`\`\`

${rodar}
`;
}

function gerarProjeto(p) {
  const raiz = p.artifactId + "/";
  const pasta = p.pacote.replace(/\./g, "/");
  const arquivos = [
    { nome: "pom.xml", conteudo: gerarPom(p) },
    { nome: "README.md", conteudo: gerarReadme(p) },
    { nome: ".gitignore", conteudo: GITIGNORE },
    { nome: `src/main/java/${pasta}/App.java`, conteudo: gerarApp(p) },
    { nome: "src/main/resources/.gitkeep", conteudo: "" },
    { nome: `src/test/java/${pasta}/AppTest.java`, conteudo: gerarTeste(p) },
  ];
  if (p.war) arquivos.push({
    nome: "src/main/webapp/index.html",
    conteudo: `<!DOCTYPE html>\n<html lang="pt-BR">\n<head><meta charset="UTF-8"><title>${escaparXml(p.artifactId)}</title></head>\n<body><h1>${escaparXml(p.artifactId)}</h1></body>\n</html>\n`,
  });
  return arquivos.map(a => ({ ...a, nome: raiz + a.nome }));
}

// Baixa o projeto inteiro em .zip. Dentro do Claude, usa a API de downloads da página.
const apiDownloads = window.claude?.use ? window.claude.use("downloads") : Promise.resolve(null);

async function baixarProjeto(p) {
  const zip = criarZip(gerarProjeto(p));
  const nome = `${p.artifactId}.zip`;
  const api = await apiDownloads;
  if (api) {
    await api.save({ filename: nome, data: zip });
    return;
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(zip);
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Escapa o XML inteiro antes de inserir como HTML; depois marca os valores dos campos.
function marcarValores(pom) {
  const marcas = {
    groupId: "groupId", artifactId: "artifactId", version: "versao", description: "descricao",
    packaging: "empacotamento", "maven\\.compiler\\.(?:release|source|target)": "java",
  };
  let html = escaparXml(pom);
  for (const [tag, campo] of Object.entries(marcas)) {
    // Só a primeira ocorrência (a do projeto); source e target do Java 8 entram os dois.
    const regex = new RegExp(`(&lt;(${tag})&gt;)(.*?)(?=&lt;/)`, campo === "java" ? "g" : "");
    html = html.replace(regex, (_, abre, nome, valor) => `${abre}<mark data-campo="${campo}">${valor}</mark>`);
  }
  return html;
}

function realcar() {
  const foco = document.activeElement;
  const campo = foco?.name || foco?.id;
  document.querySelectorAll("mark").forEach(m => m.classList.toggle("ativo", m.dataset.campo === campo));
}

function atualizar() {
  const p = lerFormulario();
  const erro = validar(p);
  $("erro").textContent = erro;
  $("aviso").textContent = "";
  if (erro) $("previa").textContent = "Corrija o formulário para ver a prévia.";
  else $("previa").innerHTML = marcarValores(gerarPom(p));
  document.querySelectorAll('button[type="submit"], #copiar').forEach(b => b.disabled = Boolean(erro));
  realcar();
}

// O pacote acompanha group e artifact até a pessoa editá-lo; se ela apagar, volta a acompanhar.
let pacoteEditado = false;
$("formulario").addEventListener("input", e => {
  if (e.target.id === "pacote") pacoteEditado = e.target.value.trim() !== "";
  if (!pacoteEditado) $("pacote").value = sugerirPacote($("groupId").value.trim(), $("artifactId").value.trim());
  atualizar();
});
// Ctrl + Enter (ou Cmd + Enter) baixa o projeto de qualquer lugar da página.
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    $("formulario").requestSubmit();
  }
});
$("formulario").addEventListener("focusin", realcar);
$("formulario").addEventListener("focusout", () => setTimeout(realcar));

$("formulario").addEventListener("submit", async e => {
  e.preventDefault();
  const p = lerFormulario();
  if (validar(p)) return;
  try {
    await baixarProjeto(p);
    $("aviso").textContent = `Projeto ${p.artifactId}.zip baixado.`;
  } catch (erro) {
    $("aviso").textContent = erro?.code === "declined"
      ? "Download cancelado."
      : "Não foi possível baixar o arquivo. Tente novamente.";
  }
});

$("copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("previa").textContent);
    $("aviso").textContent = "pom.xml copiado.";
  } catch {
    $("aviso").textContent = "Não foi possível copiar. Selecione o texto da prévia.";
  }
});

atualizar();

// Tema claro/escuro: sem escolha salva, segue o sistema.
const sistemaEscuro = matchMedia("(prefers-color-scheme: dark)");
const temaAtual = () => document.documentElement.dataset.theme || (sistemaEscuro.matches ? "dark" : "light");

function marcarTema() {
  document.querySelectorAll("[data-tema]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tema === temaAtual())));
}

document.querySelectorAll("[data-tema]").forEach(botao => botao.addEventListener("click", () => {
  document.documentElement.dataset.theme = botao.dataset.tema;
  try { localStorage.setItem("tema", botao.dataset.tema === "dark" ? "escuro" : "claro"); } catch {}
  marcarTema();
}));
sistemaEscuro.addEventListener("change", marcarTema);
marcarTema();
