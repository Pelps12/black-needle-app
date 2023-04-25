import { authedProcedure, t } from '../trpc';
import { z } from 'zod';
import {
	S3Client,
	ListBucketsCommand,
	ListObjectsV2Command,
	GetObjectCommand,
	PutObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from 'env/server.mjs';
import crypto from 'crypto';

export const uploadRouter = t.router({
	uploadImages: t.procedure
		.input(
			z.object({
				url1: z.string(),
				url2: z.string(),
				url3: z.string(),
				url4: z.string(),
				categoryId: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const images = await ctx.prisma.image.createMany({
				data: [
					{ link: input.url1, categoryId: input.categoryId },
					{ link: input.url2, categoryId: input.categoryId },
					{ link: input.url3, categoryId: input.categoryId },
					{ link: input.url4, categoryId: input.categoryId }
				]
			});
			return images;
		}),
	getPresignedUrl: authedProcedure.input(z.object({})).mutation(async ({ input, ctx }) => {
		const r2 = new S3Client({
			region: 'auto',
			endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
				secretAccessKey: env.CLOUDFLARE_ACCESS_SECRET
			}
		});
		console.log(r2);

		const url = await getSignedUrl(
			r2,
			new GetObjectCommand({ Bucket: 'black-needle-private', Key: 'HDCY0620.JPG' }),
			{ expiresIn: 60 }
		);

		return url;
	})
});
