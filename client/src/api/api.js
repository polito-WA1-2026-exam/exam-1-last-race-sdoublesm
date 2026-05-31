const API_URL = 'http://localhost:3001/api';

// Recupera l'intero grafo della rete metropolitana
export async function getNetwork() {
  try {
    const response = await fetch(`${API_URL}/network`, {
      credentials: 'include'
    });

    if (response.ok) {
      const networkData = await response.json();
      return networkData;
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error('HTTP error in getNetwork, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}
