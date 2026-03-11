//recuper le informazioni del repository dal link di un repository (no file, solo repo)
export const getRepoInfo = (url: string) => {
  const cleanUrl = url.trim().replace(/\/$/, "").replace(".git", "");
  
  const parts = cleanUrl.split("/");

  return {
    owner: parts[3] || "Sconosciuto",
    repoName: parts[4] || "Sconosciuto",
    hasFilePath: parts.length > 5 
  };
};

//recupero le informazioni di un file dal suo link (compreso di commit)
export const getFileInfo = (url: string) => {
  const parts = url.replace("https://github.com/", "").split("/");
  
  const repoName = parts[1];
  const filePath = parts.slice(4).join("/");

  return {
    owner: parts[0],
    repoName: repoName,
    commit: parts[3],
    filePath: filePath
  };
};

// --- recupero il codice di un file indicato dal suo link (compreso di commit) ---

//prima trasformo il link per ottenere il row
export const getRawGithubUrl = (url: string): string => {
  return url
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");
};

//poi otgengo il codice al suo interno
export const fetchFileContent = async (url: string): Promise<string> => {
  const rawUrl = getRawGithubUrl(url);
  const response = await fetch(rawUrl);
  if (!response.ok) throw new Error("File non trovato");
  return await response.text();
};

// mi dice se il repository è privato o pubblico
export const checkRepoVisibility = async (url: string): Promise<string> => {
  try {
    const { owner, repoName } = getRepoInfo(url);
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
    
    if (response.status === 404) {
      return "Inesistente";
    }

    if (!response.ok) throw new Error();

    const data = await response.json();
    return data.private ? "Privata" : "Pubblica";
    
  } catch (error) {
    return "Errore nel recupero visibilità";
  }
};