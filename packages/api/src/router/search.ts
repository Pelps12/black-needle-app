import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const searchRouter = router({
  algoliaTransform: publicProcedure.mutation(async ({ ctx }) => {
    const categories = await ctx.prisma.category.findMany({
      include: {
        prices: true,
        Image: true,
      },
    });
    return categories.map(({ id, ...rest }) => ({
      objectID: id,
      school: "UT Dallas",
      ...rest,
    }));
  }),
});
