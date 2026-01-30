import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export const UserService = {
  async createPseudoUser(name: string) {
    const tempSlug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
    return await prisma.user.create({
      data: {
        name,
        slug: tempSlug,
        privateToken: uuidv4(),
        isComplete: false, 
      }
    });
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

    const finalSlug = cleanName.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { slug: finalSlug } });
    if (existing && existing.id !== id) throw new Error("This name is already taken.");

    return prisma.user.update({
      where: { id },
      data: { 
        name: cleanName, 
        slug: finalSlug,
        isComplete: true 
      },
    });
  },

  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { spaces: true },
    });
  },
  async getPublicProfile(slug: string) {
    return prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        spaces: {
          where: { type: 'PUBLIC' },
          include: { contents: true }
        }
      }
    });
  },
  
  async getUserBySlug (slug: string){
   return await prisma.user.findUnique({
      where: { slug },
      include: { spaces: true }
    });

  }
};
