const tokenize = (line, lang) => {
  if (lang === "yaml") return tokenizeYaml(line);
  if (lang === "java") return tokenizeJava(line);
  if (lang === "groovy" || lang === "jenkinsfile") return tokenizeGroovy(line);
  if (lang === "dockerfile") return tokenizeDockerfile(line);
  if (lang === "bash" || lang === "sh") return tokenizeBash(line);
  return [{ type: "plain", text: line }];
};

const tokenizeYaml = (line) => {
  const tokens = [];
  const commentMatch = line.match(/^(\s*)(#.*)$/);
  if (commentMatch) {
    if (commentMatch[1]) tokens.push({ type: "plain", text: commentMatch[1] });
    tokens.push({ type: "comment", text: commentMatch[2] });
    return tokens;
  }
  const keyValMatch = line.match(/^(\s*)([a-zA-Z0-9_\-./]+)(\s*:\s*)(.*)$/);
  if (keyValMatch) {
    const [, indent, key, sep, val] = keyValMatch;
    if (indent) tokens.push({ type: "plain", text: indent });
    tokens.push({ type: "key", text: key });
    tokens.push({ type: "punctuation", text: sep });
    if (val) {
      if (/^["']/.test(val)) {
        tokens.push({ type: "string", text: val });
      } else if (/^\d/.test(val) && !/[^0-9.]/.test(val.trim())) {
        tokens.push({ type: "number", text: val });
      } else if (val === "true" || val === "false" || val === "null") {
        tokens.push({ type: "keyword", text: val });
      } else if (/^\|/.test(val) || /^>/.test(val)) {
        tokens.push({ type: "keyword", text: val });
      } else {
        tokens.push({ type: "value", text: val });
      }
    }
    return tokens;
  }
  const listItemMatch = line.match(/^(\s*)(- )(.*)$/);
  if (listItemMatch) {
    const [, indent, dash, rest] = listItemMatch;
    if (indent) tokens.push({ type: "plain", text: indent });
    tokens.push({ type: "punctuation", text: dash });
    tokens.push(...tokenizeYaml(rest));
    return tokens;
  }
  return [{ type: "plain", text: line }];
};

const JAVA_KEYWORDS = new Set(["public", "private", "protected", "class", "interface", "extends", "implements", "return", "new", "static", "void", "import", "package", "final", "abstract", "if", "else", "for", "while", "try", "catch", "throws", "this", "super", "null", "true", "false"]);
const JAVA_TYPES = new Set(["String", "Map", "List", "int", "long", "boolean", "double", "Object", "SpringApplication", "SpringBootApplication", "RestController", "GetMapping", "Bean", "Override"]);

const tokenizeJava = (line) => {
  const tokens = [];
  const commentMatch = line.match(/^(\s*)(\/\/.*)$/);
  if (commentMatch) {
    if (commentMatch[1]) tokens.push({ type: "plain", text: commentMatch[1] });
    tokens.push({ type: "comment", text: commentMatch[2] });
    return tokens;
  }
  const annotationMatch = line.match(/^(\s*)(@\w+)(.*)$/);
  if (annotationMatch) {
    if (annotationMatch[1]) tokens.push({ type: "plain", text: annotationMatch[1] });
    tokens.push({ type: "annotation", text: annotationMatch[2] });
    if (annotationMatch[3]) tokens.push(...tokenizeJavaRest(annotationMatch[3]));
    return tokens;
  }
  return tokenizeJavaRest(line);
};

const tokenizeJavaRest = (line) => {
  const tokens = [];
  const regex = /"[^"]*"|'[^']*'|\/\/.*|@\w+|\b\w+\b|[{}();,.<>[\]]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", text: line.slice(lastIndex, match.index) });
    }
    const word = match[0];
    if (word.startsWith('"') || word.startsWith("'")) {
      tokens.push({ type: "string", text: word });
    } else if (word.startsWith("//")) {
      tokens.push({ type: "comment", text: word });
    } else if (word.startsWith("@")) {
      tokens.push({ type: "annotation", text: word });
    } else if (JAVA_KEYWORDS.has(word)) {
      tokens.push({ type: "keyword", text: word });
    } else if (JAVA_TYPES.has(word)) {
      tokens.push({ type: "type", text: word });
    } else if (/^\d+$/.test(word)) {
      tokens.push({ type: "number", text: word });
    } else if (/[{}();,]/.test(word)) {
      tokens.push({ type: "punctuation", text: word });
    } else {
      tokens.push({ type: "plain", text: word });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: "plain", text: line.slice(lastIndex) });
  }
  return tokens;
};

const GROOVY_KEYWORDS = new Set(["pipeline", "agent", "any", "stages", "stage", "steps", "environment", "sh", "echo", "def", "return", "true", "false", "null", "withCredentials", "string", "credentialsId", "variable"]);

const tokenizeGroovy = (line) => {
  const commentMatch = line.match(/^(\s*)(\/\/.*)$/);
  if (commentMatch) {
    return [
      commentMatch[1] ? { type: "plain", text: commentMatch[1] } : null,
      { type: "comment", text: commentMatch[2] }
    ].filter(Boolean);
  }
  const tokens = [];
  const regex = /"[^"]*"|'[^']*'|\/\/.*|\b\w+\b|[{}()[\]=,]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", text: line.slice(lastIndex, match.index) });
    }
    const word = match[0];
    if (word.startsWith('"') || word.startsWith("'")) {
      tokens.push({ type: "string", text: word });
    } else if (word.startsWith("//")) {
      tokens.push({ type: "comment", text: word });
    } else if (GROOVY_KEYWORDS.has(word)) {
      tokens.push({ type: "keyword", text: word });
    } else if (/^[A-Z]/.test(word)) {
      tokens.push({ type: "type", text: word });
    } else if (/^\d+$/.test(word)) {
      tokens.push({ type: "number", text: word });
    } else if (/[{}()[\]]/.test(word)) {
      tokens.push({ type: "punctuation", text: word });
    } else {
      tokens.push({ type: "plain", text: word });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) tokens.push({ type: "plain", text: line.slice(lastIndex) });
  return tokens;
};

const DOCKER_INSTRUCTIONS = new Set(["FROM", "WORKDIR", "COPY", "RUN", "EXPOSE", "ENTRYPOINT", "CMD", "ENV", "ARG", "LABEL", "USER", "VOLUME", "ADD"]);

const tokenizeDockerfile = (line) => {
  const commentMatch = line.match(/^(\s*)(#.*)$/);
  if (commentMatch) {
    return [
      commentMatch[1] ? { type: "plain", text: commentMatch[1] } : null,
      { type: "comment", text: commentMatch[2] }
    ].filter(Boolean);
  }
  const instrMatch = line.match(/^([A-Z]+)(\s+)(.*)$/);
  if (instrMatch && DOCKER_INSTRUCTIONS.has(instrMatch[1])) {
    const tokens = [{ type: "keyword", text: instrMatch[1] }, { type: "plain", text: instrMatch[2] }];
    const rest = instrMatch[3];
    if (rest.startsWith('"') || rest.startsWith("[")) {
      tokens.push({ type: "string", text: rest });
    } else if (/^\d/.test(rest)) {
      tokens.push({ type: "number", text: rest });
    } else {
      const parts = rest.split(/\s+AS\s+/i);
      if (parts.length === 2) {
        tokens.push({ type: "value", text: parts[0] });
        tokens.push({ type: "plain", text: " " });
        tokens.push({ type: "keyword", text: "AS" });
        tokens.push({ type: "plain", text: " " });
        tokens.push({ type: "builtin", text: parts[1] });
      } else {
        tokens.push({ type: "value", text: rest });
      }
    }
    return tokens;
  }
  return [{ type: "plain", text: line }];
};

const tokenizeBash = (line) => {
  const commentMatch = line.match(/^(\s*)(#.*)$/);
  if (commentMatch) {
    return [
      commentMatch[1] ? { type: "plain", text: commentMatch[1] } : null,
      { type: "comment", text: commentMatch[2] }
    ].filter(Boolean);
  }
  const tokens = [];
  const regex = /"[^"]*"|'[^']*'|\$\{[^}]+\}|\$\w+|--?\w[\w-]*|\b(kubectl|docker|git|sed|cd|echo|curl)\b|[|\\&;]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "plain", text: line.slice(lastIndex, match.index) });
    }
    const word = match[0];
    if (word.startsWith('"') || word.startsWith("'")) {
      tokens.push({ type: "string", text: word });
    } else if (word.startsWith("${") || word.startsWith("$")) {
      tokens.push({ type: "builtin", text: word });
    } else if (word.startsWith("--") || word.startsWith("-")) {
      tokens.push({ type: "flag", text: word });
    } else if (["kubectl", "docker", "git", "sed", "cd", "echo", "curl"].includes(word)) {
      tokens.push({ type: "cmd", text: word });
    } else if (["|", "\\", "&", ";"].includes(word)) {
      tokens.push({ type: "punctuation", text: word });
    } else {
      tokens.push({ type: "plain", text: word });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) tokens.push({ type: "plain", text: line.slice(lastIndex) });
  return tokens;
};

export default function CodeBlock({ code, lang = "plain", filename }) {
  const lines = code.split("\n");
  const langLabel = {
    yaml: "YAML",
    java: "Java",
    groovy: "Groovy",
    jenkinsfile: "Jenkinsfile",
    dockerfile: "Dockerfile",
    bash: "Bash",
    sh: "Shell",
    plain: "Text",
  }[lang] || lang.toUpperCase();

  return (
    <div className="vscode-window">
      <div className="vscode-titlebar">
        <div className="vscode-dots">
          <div className="vscode-dot red" />
          <div className="vscode-dot yellow" />
          <div className="vscode-dot green" />
        </div>
        {filename && <span className="vscode-filename">{filename}</span>}
        <span className="vscode-lang-badge">{langLabel}</span>
      </div>
      <div className="vscode-body">
        <table className="vscode-table">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="vscode-line-num-col">{i + 1}</td>
                <td className="vscode-code-col">
                  {tokenize(line, lang).map((tok, j) => (
                    <span key={j} className={`tok-${tok.type}`}>{tok.text}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}