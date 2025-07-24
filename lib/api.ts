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
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return data;
    }
    
    console.error('Upload failed:', data);
    return null;
  } catch (error) {
    console.error('Error uploading:', error);
    return null;
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