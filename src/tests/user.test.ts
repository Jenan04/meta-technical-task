import { UserService } from "@/services/userService";
import { prisma } from "@/lib/prisma";
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { User } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>;

jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid-1234'
}));

describe("UserService", () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  describe("updateUser", () => {
    const userId = "user-123";

    it("should successfully update user data when provided with a valid name", async () => {
      const mockUser: User = {
        id: userId,
        name: "Ahmed",
        slug: "ahmed",
        privateToken: "token-123",
        isComplete: true,
        createsAt: new Date(), 
      };

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserService.updateUser(userId, "Ahmed");

      expect(result.name).toBe("Ahmed");
      expect(result.isComplete).toBe(true);
    });
  });

  describe("createPseudoUser", () => {
    it("should create a user with correct initial profile data", async () => {
      const mockCreatedUser: User = {
        id: "new-id",
        name: "Guest User",
        slug: "guest-user-123",
        privateToken: "uuid-token",
        isComplete: false,
        createsAt: new Date(),
      };

      (prismaMock.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await UserService.createPseudoUser("Guest User");

      expect(result.name).toBe("Guest User");
      expect(result.isComplete).toBe(false);
    });
  });
});