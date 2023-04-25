import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const searchRouter = router({
  getSearchedPrices: publicProcedure
    .input(
      z.object({
        school: z.string(),
        category: z.string(),
        price: z
          .object({
            range: z.object({
              low: z.number(),
              high: z.number(),
            }),
            order: z.enum(["asc", "desc"]),
          })
          .partial()
          .superRefine((data, ctx) => {
            if (!data.range && !data.order) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["range"],
                message: "Range should be set if image isn't",
              });
            }
          })
          .nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      const words = input.category.split(" ");
      console.log(words);
      const searchResults = await client.search({
        index: "products",
        ...(input.price?.order
          ? {
              sort: [
                {
                  amount: {
                    order: input.price.order,
                  },
                },
              ],
            }
          : {}),
        query: {
          ...(input.price?.range
            ? {
                range: {
                  amount: {
                    gte: input.price.range.low,
                    lte: input.price.range.high,
                  },
                },
              }
            : {}),

          bool: {
            must: [
              {
                match_phrase: {
                  school: input.school,
                },
              },
              {
                span_near: {
                  clauses: input.category
                    .trim()
                    .toLowerCase()
                    .split(" ")
                    .map((word) => {
                      return {
                        span_multi: {
                          match: {
                            fuzzy: {
                              "category-name": {
                                value: word,
                                fuzziness: 2,
                              },
                            },
                          },
                        },
                      };
                    }),
                  slop: 0,
                  in_order: false,
                },
              },
            ],
          },
        },
      });
      //console.log(searchResults);
      return searchResults.hits.hits;
    }),
});
