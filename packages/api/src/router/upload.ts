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
import r2 from "../utils/r2";

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

  putPresignedUrl: protectedProcedure
    .input(
      z.object({
        type: z.enum(["PUT"]),
        roomId: z.string(),
        key: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log("bnuiovernvoernv oernv eor");

      const imageId = randomUUID();
      const url = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: "black-needle-private",
          Key: `chat/${imageId}`,
          ContentType: "image/jpeg",
          Metadata: {
            roomId: input.roomId,
          },
        }),
        { expiresIn: 3000 },
      );
      console.log({ url, imageId });
      return { url, imageId };
    }),

  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        type: z.enum(["GET"]),
        roomId: z.string(),
        key: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [{ Metadata, MissingMeta }, url, room] = await Promise.all([
        r2.send(
          new HeadObjectCommand({
            Bucket: "black-needle-private",
            Key: `chat/${input.key}`,
          }),
        ),
        getSignedUrl(
          r2,
          new GetObjectCommand({
            Bucket: "black-needle-private",
            Key: `chat/${input.key}`,
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
      console.log(Metadata);

      if (Metadata) {
        const roomId = Metadata["roomid"];
        //If the object belongs to this room and the user is a member of this room
        console.log(roomId, room, MissingMeta);
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
    }),
});
