import { prisma } from '@/lib/prisma';

export const ContentService = {
   async createPseudoUser(name: string) {
    const user = await prisma.user.create({
      data: { name },
    });

    await prisma.space.create({
      data: {
        userId: user.id,
        type: 'PRIVATE',
      },
    });

    return user;
  },

  async updateUser(id: string, name: string) {
    const cleanName = name.trim();

  if (cleanName.length < 2 || cleanName.length > 16) {
    throw new Error("Name must be between 2 and 16 characters.");
  }

  const hasSpaces = /\s/.test(cleanName);
  if (hasSpaces) {
    throw new Error("Name cannot contain spaces.");
  }

  const isValidChars = /^[a-zA-Z0-9_]+$/.test(cleanName);
  if (!isValidChars) {
    throw new Error("Name can only contain letters, numbers, and underscores.");
  }

  return prisma.user.update({
    where: { id },
    data: { 
      name: cleanName,
      isComplete: true 
    },
  });
  },

   async addContent(
    userId: string,
    spaceId: string,
    type: string,
    data: string,
    visibility: 'PRIVATE' | 'PUBLIC'
  ) {

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isComplete: true }
    });

    if (!user || user.isComplete) {
      throw new Error("You must set your name before adding content");
    }

    const size = data.length;

    return prisma.content.create({
      data: {
        type,
        data,
        size,
        visibility,
        spaceId,
      },
    });
  },

   async getSpaceContents(spaceId: string) {
    return prisma.content.findMany({
      where: { spaceId },
    });
  },

  async getUser(id: string) {
    return await prisma.user.findUnique({
        where: { id },
        include: { spaces: true } 
      });
  }

}
