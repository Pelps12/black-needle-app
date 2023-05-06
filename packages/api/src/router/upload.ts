import { randomUUID } from "crypto";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const uploadRouter = router({
  uploadImages: publicProcedure
    .input(
      z.object({
        url1: z.string(),
        url2: z.string(),
        url3: z.string(),
        url4: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const images = await ctx.prisma.image.createMany({
        data: [
          { link: input.url1, categoryId: input.categoryId },
          { link: input.url2, categoryId: input.categoryId },
          { link: input.url3, categoryId: input.categoryId },
          { link: input.url4, categoryId: input.categoryId },
        ],
      });
      return images;
    }),

  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        type: z.enum(["PUT", "GET"]),
        roomId: z.string(),
        key: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const r2 = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY,
          secretAccessKey: process.env.CLOUDFLARE_ACCESS_SECRET,
        },
      });
      if (input.type === "GET") {
        const [{ Metadata }, url, room] = await Promise.all([
          r2.send(
            new HeadObjectCommand({
              Bucket: "black-needle-private",
              Key: input.key,
            }),
          ),
          getSignedUrl(
            r2,
            new GetObjectCommand({
              Bucket: "black-needle-private",
              Key: input.key,
            }),
            { expiresIn: 60 },
          ),
          ctx.prisma.room.findFirst({
            where: {
              id: input.roomId,
              Participant: {
                some: {
                  userId: ctx.auth.userId,
                },
              },
            },
          }),
        ]);
        return url;
        if (Metadata) {
          const roomId = Metadata["roomId"];
          //If the object belongs to this room and the user is a member of this room
          if (roomId === input.roomId && room) {
            return url;
          } else {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "You do not have permission to join this room",
            });
          }
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Object is invalid",
          });
        }
      } else {
        const url = await getSignedUrl(
          r2,
          new PutObjectCommand({
            Bucket: "black-needle-private",
            Key: `chat/${randomUUID()}`,
            ContentType: "image/jpeg",
            Metadata: {
              roomId: input.roomId,
            },
          }),
          { expiresIn: 3000 },
        );
        return url;
      }
    }),
});
