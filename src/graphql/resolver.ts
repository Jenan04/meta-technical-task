import { ContentService } from '@/services/contentService';

export const resolvers = {
  Query: {
    getUser: async (_: unknown, { id }: { id: string }) => {
      return ContentService.getUser(id);
    }, 

    getSpaceContents: async (_: unknown, { spaceId }: { spaceId: string }) => {
      return ContentService.getSpaceContents(spaceId);
    },
  },
  Mutation: {
    createPseudoUser: async (_: unknown, { name }: { name: string }) => {
      return ContentService.createPseudoUser(name);
    },

    updateUser: async (_: unknown, { id, name }: {id: string, name: string}) => {
      return await ContentService.updateUser(id, name);
    },

    addContent: async (
      _: unknown,
      {
        userId,
        spaceId,
        type,
        data,
        visibility,
      }: { userId:string, spaceId: string; type: string; data: string; visibility: 'PRIVATE' | 'PUBLIC' }
    ) => {
      return ContentService.addContent(userId,spaceId, type, data, visibility);
    },
  },
};
