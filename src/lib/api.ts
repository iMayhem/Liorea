const WORKER_URL = "https://r2-gallery-api.sujeetunbeatable.workers.dev";
const GIPHY_API_KEY = "15K9ijqVrmDOKdieZofH1b6SFR7KuqG5"; // Moved from components

// Generic Helper
async function client<T>(endpoint: string, config?: RequestInit): Promise<T> {
  const headers = { 'Content-Type': 'application/json', ...config?.headers };
  const response = await fetch(`${WORKER_URL}${endpoint}`, { ...config, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  
  // Handle empty responses (like 204 No Content)
  if (response.status === 204) return {} as T;
  return response.json();
}

export const api = {
  auth: {
    checkGoogle: (email: string, photoURL?: string | null) => 
      client<{exists: boolean, username: string}>('/auth/google-check', { method: 'POST', body: JSON.stringify({ email, photoURL }) }),
      
    createAccount: (data: { email: string|null, username: string, photoURL: string|null }) => 
      client<{success: boolean, username: string}>('/auth/google-create', { method: 'POST', body: JSON.stringify(data) }),
    
    rename: (oldUsername: string, newUsername: string) =>
      client('/user/rename', { method: 'POST', body: JSON.stringify({ oldUsername, newUsername }) }),
      
    updateStatus: (username: string, status_text: string) =>
      client('/user/status', { method: 'POST', body: JSON.stringify({ username, status_text }) }),
  },

  study: {
    updateMinutes: (username: string, minutes: number) => 
      client('/study/update', { method: 'POST', body: JSON.stringify({ username, minutes }) }),
      
    getHistory: (username: string) => 
      client<Record<string, number>>(`/study/history?username=${username}`),
  },

  chat: {
    backupMessage: (data: { room_id: string, username: string, message: string, photoURL?: string }) => 
      client('/chat/send', { method: 'POST', body: JSON.stringify(data) }),
  },

  journal: {
    list: () => client<any[]>('/journals/list'),
    
    getPosts: (id: number, before?: number) => 
      client<any[]>(`/journals/posts?id=${id}${before ? `&before=${before}` : ''}`),
      
    create: (data: { username: string, title: string, tags: string, theme: string, images?: string }) => 
      client('/journals/create', { method: 'POST', body: JSON.stringify(data) }),
      
    postMessage: (data: { journal_id: number, username: string, content: string, image_url?: string }) => 
      client('/journals/post', { method: 'POST', body: JSON.stringify(data) }),
      
    react: (data: { post_id: number, username: string, emoji: string }) => 
      client('/journals/react', { method: 'POST', body: JSON.stringify(data) }),
  },

  media: {
    upload: async (file: File) => {
      // Direct PUT to worker for R2
      const response = await fetch(`${WORKER_URL}/upload`, { method: 'PUT', body: file });
      if (!response.ok) throw new Error('Upload failed');
      return response.json() as Promise<{ url: string }>;
    },
    
    getGifs: async (query?: string) => {
      const url = query 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`;
      const res = await fetch(url);
      return res.json();
    }
  }
};