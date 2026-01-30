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

    addContent: async (_: unknown, args: AddContentArgs) => {
      const { userId, spaceId, type, text, fileName, fileBuffer, visibility } = args;
      const space = await SpaceService.getSpace(spaceId, userId);
      if (!space) throw new Error("Space not found or unauthorized.");

      const upload = await UploadService.createUploadIntent(userId, spaceId, type);
      let url: string | undefined;
      let size = 0;

      if (type === "IMAGE" || type === "FILE") {
        if (!fileBuffer || !fileName) throw new Error("Missing file data");
        const buffer = typeof fileBuffer === "string" ? Buffer.from(fileBuffer, "base64") : fileBuffer;
        url = await UploadService.uploadFile(upload.id, userId, spaceId, buffer, fileName, type);
        size = buffer.length;
        await UploadService.confirmUpload(upload.id, url, size);
      } else {
        size = text?.length ?? 0;
        await UploadService.confirmUpload(upload.id, "", size);
      }

      return await UploadService.createContentFromUpload(upload.id, spaceId, visibility, text);
    }
  }
};