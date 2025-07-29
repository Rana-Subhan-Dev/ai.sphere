// API Configuration
const API_BASE_URL = 'https://0f920feba904.ngrok-free.app';

// Collection API Types
export interface UserCollection {
  name: string;
  document_count: number;
  data_types: string[];
  created_at: string;
}

export interface CollectionFile {
  file_id: string;
  fileName: string;
  fileType: string;
  fileURL: string;
  file_size: number;
  content_type: string;
  created_at: string;
  content?: string; // Added for text files
}

export interface CollectionData {
  collection_name: string;
  user_id: string;
  total_files: number;
  files: CollectionFile[];
}

export interface CollectionResponse {
  status: number;
  message: string;
  success: boolean;
  data: CollectionData;
}

export interface UploadResponse {
  success: boolean;
  chunks_added: number;
  chunk_ids: string[];
  message: string;
  url: string;
}

// Query API Types
export interface QuerySource {
  content: string;
  data_type: string;
  collection_name: string;
  metadata: Record<string, any>;
  score: number;
  chunk_id: string;
  created_at: string;
}

export interface QueryResponse {
  answer: string;
  sources: QuerySource[];
  collections_searched: string[];
}

// Query documents
export const queryDocuments = async (
  userId: string,
  query: string,
  collectionName: string = "",
  topK: number = 5
): Promise<QueryResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        query: query,
        collection_name: collectionName,
        top_k: topK,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    
    console.error('Failed to query documents:', data);
    return null;
  } catch (error) {
    console.error('Error querying documents:', error);
    return null;
  }
};

// Get user collections using the new API endpoint
export const getUserCollections = async (userId: string): Promise<UserCollection[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/user-collection?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok && Array.isArray(data)) {
      return data;
    }
    
    console.error('Failed to fetch user collections:', data);
    return [];
  } catch (error) {
    console.error('Error fetching user collections:', error);
    return [];
  }
};

// Get collection data for a specific collection
export const getUserCollectionData = async (userId: string, collectionName: string = 'any'): Promise<CollectionData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/get_collection_data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection_name: collectionName,
        user_id: userId,
      }),
    });

    const data = await response.json();
    
    if (response.ok && Array.isArray(data) && data[0]?.success) {
      return data[0].data;
    } else if (response.ok && data.success) {
      return data.data;
    }
    
    console.error('Failed to fetch collection data:', data);
    return null;
  } catch (error) {
    console.error('Error fetching collection data:', error);
    return null;
  }
};

// Upload file/content
export const uploadToCollection = async (
  userId: string,
  collectionName: string,
  dataType: 'pdf' | 'image' | 'text' | 'url',
  file?: File,
  content?: string,
  metadata?: string
): Promise<UploadResponse | null> => {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('collection_name', collectionName);
    formData.append('data_type', dataType);
    
    if (metadata) {
      formData.append('metadata', metadata);
    }
    
    if (file) {
      formData.append('file', file);
    }
    
    if (content) {
      formData.append('content', content);
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/upload`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    
    console.error('Upload failed:', data);
    
    // Throw error with detail for better error handling
    if (data.detail) {
      throw { detail: data.detail };
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading:', error);
    throw error; // Re-throw to let component handle it
  }
};

// Create new collection
export const createNewCollection = async (userId: string, collectionName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/create_new_collecction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        collection_name: collectionName,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    
    console.error('Collection creation failed:', data);
    
    // Throw error with detail for better error handling
    if (data.detail) {
      throw { detail: data.detail };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error; // Re-throw to let component handle it
  }
};

// Create new collection (with typo in URL - alternative endpoint)
export const createNewCollectionAlt = async (userId: string, collectionName: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/create_new_collecction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        collection_name: collectionName,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    
    console.error('Collection creation failed (alt endpoint):', data);
    
    // Throw error with detail for better error handling
    if (data.detail) {
      throw { detail: data.detail };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating collection (alt endpoint):', error);
    throw error; // Re-throw to let component handle it
  }
};

// Get text file content
export const getTextFileContent = async (fileId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/get_text_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_id: fileId }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return data.content;
    }
    
    console.error('Failed to fetch text content:', data);
    return null;
  } catch (error) {
    console.error('Error fetching text content:', error);
    return null;
  }
};

// Upload file with proper file handling
export const uploadFileToCollection = async (
  userId: string,
  collectionName: string,
  file: File,
  dataType: 'pdf' | 'image' | 'text' | 'url'
): Promise<UploadResponse | null> => {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('collection_name', collectionName);
    formData.append('data_type', dataType);
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/dashboard/upload`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    }
    
    console.error('File upload failed:', data);
    
    if (data.detail) {
      throw { detail: data.detail };
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get auth data from localStorage
export const getAuthData = () => {
  try {
    const savedAuth = localStorage.getItem('airis_auth');
    if (savedAuth) {
      return JSON.parse(savedAuth);
    }
  } catch (error) {
    console.error('Error parsing auth data:', error);
  }
  return null;
}; 