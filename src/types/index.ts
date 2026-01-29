export interface ContentItem {
  id: string;
  type: 'IMAGE' | 'FILE' | 'NOTE';
  url?: string;
  text?: string;
  createdAt: string;
}

export interface SpaceData {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC';
  contents: ContentItem[];
}

export interface GraphQLResponse {
  data?: {
    getSpaceBySlug: SpaceData;
  };
  errors?: Array<{ message: string }>;
}

export interface SpaceArgs {
  id: string;
  name: string;
}

export interface CreateSpaceArgs {
  userId: string;
  name: string;
  type: "PRIVATE" | "PUBLIC";
}

export interface AddContentArgs {
  userId: string;
  spaceId: string;
  type: 'IMAGE' | 'FILE' | 'NOTE';
  text?: string;
  fileName?: string;
  fileBuffer?: string | Buffer;
  visibility: 'PRIVATE' | 'PUBLIC';
}

export interface TempContentItem {
  file?: File;
  type: 'IMAGE' | 'FILE' | 'NOTE';
  text?: string;
  preview?: string;
  url?: string; 
}

export interface Space {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC';
  slug: string;
}

export interface UserData {
  name: string;
  isComplete: boolean;
}

export interface profileGraphQLResponse {
  data?: {
    getUser?: UserData;
    getUserSpaces?: Space[];
    updateUser?: UserData;
  };
  errors?: Array<{ message: string }>;
}
export interface CreateSpaceResponse {
  data?: {
    createSpace: { id: string };
  };
  errors?: Array<{ message: string }>;
}

export interface AddContentResponse {
  data?: {
    addContent: ContentItem;
  };
  errors?: Array<{ message: string }>;
}