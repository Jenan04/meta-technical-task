import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const SpaceService = {
  async createSpace(userId: string, name: string, type: "PRIVATE" | "PUBLIC") {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const existing = await prisma.space.findUnique({ where: { slug } });
    if (existing) throw new Error("Space with this name already exists.");

    return prisma.space.create({
      data: {
        userId,
        name,
        slug,
        type,
      },
    });
  },

  async getSpace(spaceId: string, userId: string) {
    const space = await prisma.space.findUnique({ 
      where: { id: spaceId },
      include: { contents: true}
     });

    if (!space) throw new Error("Space not found");
    if (space.userId !== userId) throw new Error("You cannot access this space");
    return space;
  },

  async getUserSpaces(userId: string) {
    return prisma.space.findMany({ 
      where: { userId },
      orderBy: { id: 'desc' }
     });
  },
 
 
  async updateSpace(id: string, name?: string, type?: "PRIVATE" | "PUBLIC") {
    const dataToUpdate: Prisma.SpaceUpdateInput = {};
    
    if (name) {
      const newSlug = name.toLowerCase().replace(/\s+/g, '-');
      const duplicate = await prisma.space.findFirst({
        where: { 
          slug: newSlug, 
          NOT: { id: id } 
        }
      });

      if (duplicate) throw new Error("The name is already taken.");

      dataToUpdate.name = name;
      dataToUpdate.slug = newSlug;
    }

    if (type) {
      dataToUpdate.type = type;
    }

    return prisma.space.update({
      where: { id },
      data: dataToUpdate,
    });
  },

  async deleteSpace(id: string) {
    try {
      await prisma.content.deleteMany({
        where: { spaceId: id },
      });

      const deletedSpace = await prisma.space.delete({
        where: { id },
      });

      return deletedSpace;
    } catch (error: unknown) {
      throw new Error("Could not delete space. It might not exist.");
    }
  },
  async getSpaceBySlug(slug: string) {
    const space = await prisma.space.findUnique({
      where: { slug },
      include: { 
        contents: { 
          orderBy: { createdAt: 'desc' } 
        } 
      }
    });

    if (!space) {
      throw new Error("Space not found with this slug");
    }

    return space;
  },
};
