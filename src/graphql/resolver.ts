import { UserService } from '@/services/userService';
import { UploadService } from "@/services/uploadService";
import { SpaceService } from "@/services/spaceService";
import { GraphQLError } from 'graphql';
import { CreateSpaceArgs, AddContentArgs } from "@/types"

export const resolvers = {
  Query: {
    getUser: async (_: unknown, { id }: { id: string }) => {
      try {
        const user = await UserService.getUser(id);
        if (!user) throw new GraphQLError("User not found");

        const spaces = await SpaceService.getUserSpaces(id);
        return { ...user, spaces };
      } catch (error: unknown) {
        throw new GraphQLError(error instanceof Error ? error.message : "Unknown error");
      }
    },

    getPublicProfile: async (_: unknown, { slug }: { slug: string }) => {
      try {
        const user = await UserService.getPublicProfile(slug);
        if (!user) throw new GraphQLError("Profile not found");
        return user;
      } catch (error: unknown) {
        throw new GraphQLError("Could not fetch public profile");
      }
    },

    getPrivateProfileByToken: async (_: unknown, { slug, token }: { slug: string, token: string }) => {
      try {
        const user = await UserService.getUserBySlug(slug)

        if (!user || user.privateToken !== token) {
          throw new GraphQLError("Unauthorized: Invalid secret link");
        }

        return user;
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message);
        }
         throw new GraphQLError("An unexpected error occurred");
      }
    },

    getUserSpaces: async (_: unknown, { userId }: { userId: string }) => {
      try {
        return await SpaceService.getUserSpaces(userId);
      } catch (error: unknown) {
        throw new GraphQLError("Failed to fetch user spaces");
      }
    },

    getSpaceContents: async (_: unknown, { spaceId }: { spaceId: string }) => {
      try {
        return await UploadService.getSpaceContents(spaceId);
      } catch (error: unknown) {
        throw new GraphQLError("Failed to fetch space contents");
      }
    },

    getSpaceBySlug: async (_: unknown, { slug }: { slug: string }) => {
      try {
        return await SpaceService.getSpaceBySlug(slug);
      } catch (error: unknown) {
        throw new GraphQLError("Error fetching space");
      }
    },
    getPendingUploads: async (_: unknown, { userId }: { userId: string }) => {
    try {
      return await UploadService.getPendingUploads(userId);
    } catch (error: unknown) {
      throw new GraphQLError("Could not fetch pending uploads");
    }
  }
  },

  Mutation: {
    createPseudoUser: async (_: unknown, { name }: { name: string }) => {
      return await UserService.createPseudoUser(name);
    },

    updateUser: async (_: unknown, { id, name }: { id: string; name: string }) => {
      return await UserService.updateUser(id, name);
    },

    createSpace: async (_: unknown, { userId, name, type }: CreateSpaceArgs) => {
      return await SpaceService.createSpace(userId, name, type);
    },

    updateSpace: async (_: unknown, { id, name, type }: { id: string; name?: string; type?: "PRIVATE" | "PUBLIC" }) => {
      try {
        return await SpaceService.updateSpace(id, name, type);
      } catch (error) {
        throw new GraphQLError("Could not update space");
      }
    },

    deleteSpace: async (_: unknown, { id }: { id: string }) => {
      try {
        await SpaceService.deleteSpace(id);
        return true; 
    } catch (error) {
        throw new GraphQLError("Could not delete space");
    }
    },

    deleteContent: async (_: unknown, { id }: { id: string }) => {
      try {
        return await UploadService.deleteContent(id);
      } catch (error) {
        throw new GraphQLError("Could not delete item");
      }
    },

    
  startUpload: async (_: unknown, { userId, spaceId, type }: { userId: string, spaceId: string, type: "IMAGE" | "FILE" | "NOTE" }) => {
    try {
      const space = await SpaceService.getSpace(spaceId, userId);
      if (!space) throw new GraphQLError("Space not found or unauthorized.");

      return await UploadService.createUploadIntent(userId, spaceId, type);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to start upload intent";
      throw new GraphQLError(message);
    }
  },

  finishUpload: async (_: unknown, { uploadId, url, size, visibility }: { uploadId: string, url: string, size: number, visibility: "PRIVATE" | "PUBLIC" }) => {
    try {
      return await UploadService.finalizeUpload(uploadId, url, size, visibility);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to finalize upload";
      throw new GraphQLError(message);
    }
  },

  addContent: async (_: unknown, args: AddContentArgs) => {
    try {
      const space = await SpaceService.getSpace(args.spaceId, args.userId);
      if (!space) throw new GraphQLError("Space not found or unauthorized.");

      return await UploadService.addDirectContent(args);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add content";
      throw new GraphQLError(message);
    }
  },

  reportUploadFailure: async (_: unknown, { uploadId }: { uploadId: string }) => {
    try {
      return await UploadService.markUploadAsFailed(uploadId);
    } catch (error: unknown) {
      throw new GraphQLError("Failed to report error");
    }
  }
  }
};