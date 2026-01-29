import { prisma } from "@/lib/prisma";

export const UserService = {
  async createPseudoUser(name: string) {
    const user = await prisma.user.create({ data: { name } });
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
      data: { name: cleanName, isComplete: true },
    });
  },

  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { spaces: true },
    });
  },
};
