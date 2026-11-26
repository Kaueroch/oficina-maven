const $ = id => document.getElementById(id);

function lerFormulario() {
  const marcado = nome => document.querySelector(`input[name="${nome}"]:checked`).value;
  return {
    groupId: $("groupId").value.trim(),
    artifactId: $("artifactId").value.trim(),
    versao: $("versao").value.trim(),
    descricao: $("descricao").value.trim(),
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
  return "";
}

const escaparXml = t => t.replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

function gerarPom(p) {
  // O Java 8 não aceita a propriedade "release" em um JDK 8.
  const compilador = p.java < 11
    ? `    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>`
    : `    <maven.compiler.release>${p.java}</maven.compiler.release>`;

  // Em WAR, fixa um plugin recente, que não exige web.xml.
  const build = p.war ? `
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
      </plugin>
    </plugins>
  </build>
` : "";

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
  </properties>
${build}</project>
`;
}

// Em hospedagem comum, baixa o pom.xml direto. A página publicada no Claude
// não permite salvar .xml, então lá o arquivo vai dentro de um .zip.
const apiDownloads = window.claude?.use ? window.claude.use("downloads") : Promise.resolve(null);

async function baixarPom(pom) {
  const api = await apiDownloads;
  if (api) {
    await api.save({ filename: "pom.zip", data: criarZip([{ nome: "pom.xml", conteudo: pom }]) });
    return;
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([pom], { type: "application/xml" }));
  link.download = "pom.xml";
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

$("formulario").addEventListener("input", atualizar);
// Ctrl + Enter (ou Cmd + Enter) baixa o pom.xml de qualquer lugar da página.
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
    await baixarPom(gerarPom(p));
    $("aviso").textContent = "pom.xml gerado.";
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
