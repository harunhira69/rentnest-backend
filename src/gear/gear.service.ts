import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { CreateGearPayload, GearFilterQuery } from "./gear.interface";

const createGearIntoDB = async (
  payload: CreateGearPayload,
  providerId: string
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const provider = await prisma.user.findUnique({
    where: {
      id: providerId,
    },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  if (provider.role !== "PROVIDER") {
    throw new Error("Only providers can create gear items");
  }

  if (provider.status === "SUSPENDED") {
    throw new Error("Suspended provider cannot create gear items");
  }

  if (payload.stock < payload.availableQuantity) {
    throw new Error("Available quantity cannot be greater than stock");
  }

  const gear = await prisma.gearItem.create({
    data: {
      name: payload.name,
      description: payload.description,
      brand: payload.brand,
      pricePerDay: Number(payload.pricePerDay),
      stock: Number(payload.stock),
      availableQuantity: Number(payload.availableQuantity),
      imageUrl: payload.imageUrl,
      specifications: payload.specifications,
      isAvailable: payload.isAvailable ?? true,
      categoryId: payload.categoryId,
      providerId,
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return gear;
};

const getAllGearFromDB = async (query: GearFilterQuery) => {
  const { category, price, brand } = query;

  const whereCondition: Prisma.GearItemWhereInput = {};

  if (category) {
    whereCondition.OR = [
      {
        categoryId: category,
      },
      {
        category: {
          is: {
            name: {
              contains: category,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (brand) {
    whereCondition.brand = {
      contains: brand,
      mode: "insensitive",
    };
  }

  if (price) {
    whereCondition.pricePerDay = {
      lte: Number(price),
    };
  }

  const gear = await prisma.gearItem.findMany({
    where: whereCondition,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return gear;
};

const getSingleGearFromDB = async (gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: {
      id: gearId,
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!gear) {
    throw new Error("Gear item not found");
  }

  return gear;
};

export const gearService = {
  createGearIntoDB,
  getAllGearFromDB,
  getSingleGearFromDB,
};