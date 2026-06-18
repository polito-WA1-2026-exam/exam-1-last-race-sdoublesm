const API_URL = 'http://localhost:3001/api';

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

export async function getRanking() {
  try {
    const response = await fetch(`${API_URL}/ranking`, {
      credentials: 'include'
    });

    if (response.ok) {
      const rankingData = await response.json();
      return rankingData;
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error('HTTP error in getRanking, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Error", { cause: ex });
  }
}

export async function getGame(gameId) {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`, {
      credentials: 'include'
    });

    if (response.ok) {
      const gameData = await response.json();
      return gameData;
    } else if (response.status === 404) {
      return null;
    } else {
      throw new Error('HTTP error in getGame, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error in getGame", { cause: ex });
  }
}

export async function startGame() {
    try {
        const response = await fetch(`${API_URL}/games`, {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const newGameData = await response.json();
            return newGameData;
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in startGame, code=' + response.status);
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error in startGame", { cause: ex });
    }
}

export async function submitRoute(gameId, routeArray) {
    try {
        const response = await fetch(`${API_URL}/games/${gameId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ route: routeArray }),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const resultData = await response.json();
            return resultData; // TODO: restituisce { status, finalScore, journey: [...] } o eventuale fallimento
            // dove journey è un array di StepResult
        } else {
            const errData = await response.json().catch(() => ({})); 
            throw new Error(errData.error || 'HTTP error in submitRoute, code=' + response.status);
        }
    } catch (ex) {
        throw new Error("Network error in submitRoute", { cause: ex });
    }
}

