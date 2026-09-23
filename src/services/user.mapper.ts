import type {
  Category,
  ProfessionalProfile,
  User,
} from "../generated/prisma/client";

export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    city: user.city,
    neighborhood: user.neighborhood,
    createdAt: user.createdAt,
  };
}

type ProfileWithCategories = ProfessionalProfile & {
  categories: { category: Category }[];
};

export function toMe(
  user: User & { professionalProfile: ProfileWithCategories | null },
) {
  const profile = user.professionalProfile;

  return {
    ...toPublicUser(user),
    professionalProfile: profile && {
      bio: profile.bio,
      photoUrl: profile.photoUrl,
      whatsapp: profile.whatsapp,
      responseRate: profile.responseRate,
      avgRating: profile.avgRating,
      reviewCount: profile.reviewCount,
      lastActiveAt: profile.lastActiveAt,
      categories: profile.categories.map(({ category }) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })),
    },
  };
}
