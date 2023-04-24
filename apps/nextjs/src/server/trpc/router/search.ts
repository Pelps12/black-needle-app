import { t, authedProcedure } from '../trpc';
import { z } from 'zod';
import { Client } from '@elastic/elasticsearch';
import { env } from '../../../env/server.mjs';

const client = new Client({
	node: 'https://194.195.222.200:30052',
	auth: {
		apiKey: env.ES_API_KEY
	},
	tls: {
		ca: env.ES_CERTIFICATE,
		rejectUnauthorized: false
	}
});

export const searchRouter = t.router({
	getesStatus: t.procedure.query(async ({ input, ctx }) => {
		const health_status = await client.ping();
		console.log(health_status);
		return health_status;
		//return env.ES_CERTIFICATE;
	}),
	
	getHomepageAppointment: t.procedure.query(
		async ({ input, ctx }) => {
			const usersWithCount = await ctx.prisma.price.findMany({
				include: {
				  _count: {
					select: { Appointment: true },
				  },
				  category: {
					select: {
						Image:true,
						name: true,
						sellerId:true
					}
				  }
				},
				orderBy: {
					Appointment:{
						_count: "desc"
					}
				  },
				  take: 6
			  })
			  return usersWithCount;
		}
	),
	getSuggestedCategories: t.procedure
		.input(z.object({ category: z.string() }))
		.mutation(async ({ input, ctx }) => {
			console.log(input.category);
			const suggestions = await client.search({
				index: 'categories',
				suggest: {
					'category-suggest-fuzzy': {
						prefix: input.category,
						completion: {
							field: 'name.completion',
							fuzzy: {
								fuzziness: 2
							}
						}
					}
				}
			});

			return suggestions.suggest;
		}),
	getSearchedPrices: t.procedure
		.input(
			z.object({
				school: z.string(),
				category: z.string(),
				price: z
					.object({
						range: z.object({
							low: z.number(),
							high: z.number()
						}),
						order: z.enum(['asc', 'desc'])
					})
					.partial()
					.superRefine((data, ctx) => {
						if (!data.range && !data.order) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								path: ['range'],
								message: "Range should be set if image isn't"
							});
						}
					})
					.nullish()
			})
		)
		.mutation(async ({ input, ctx }) => {
			console.log(input);
			const words = input.category.split(' ');
			console.log(words);
			const searchResults = await client.search({
				index: 'products',
				...(input.price?.order
					? {
							sort: [
								{
									amount: {
										order: input.price.order
									}
								}
							]
					  }
					: {}),
				query: {
					...(input.price?.range
						? {
								range: {
									amount: {
										gte: input.price.range.low,
										lte: input.price.range.high
									}
								}
						  }
						: {}),

					bool: {
						must: [
							{
								match_phrase: {
									school: input.school
								}
							},
							{
								span_near: {
									clauses: input.category.trim().toLowerCase().split(' ').map((word) => {
										return {
											span_multi: {
												match: {
													fuzzy: {
														'category-name': {
															value: word,
															fuzziness: 2
														}
													}
												}
											}
										};
									}),
									slop: 0,
									in_order: false
								}
							}
						]
					}
				}
			});
			//console.log(searchResults);
			return searchResults.hits.hits;
		}),
	getAllCategories: t.procedure.mutation(async ({ ctx }) => {
		const user = await ctx.prisma.user.findMany({
			include: {
				seller: {
					include: {
						Category: {
							distinct: ['name'],
							include: {
								Image: true,
								prices: true
							}
						}
					}
				}
			}
		});
		const arr: any = [];
		const categoryArr: any = [];

		user.forEach((user) => {
			if (user.seller) {
				user.seller.Category.forEach((cate) => {
					cate.prices.forEach((pric) => {
						const obj: any = {};
						obj['name'] = pric.name;
						obj['seller-id'] = user.id;
						obj['amount'] = pric.amount;
						obj['category-name'] = cate.name;
						obj['category-id'] = cate.id;
						obj['school'] = user.seller?.school;
						obj['image'] = cate.Image[0]?.link || 'No Image';

						arr.push({ index: 'products', id: pric.id, data: obj });
					});
					categoryArr.push({
						index: 'categories',
						id: cate.id,
						data: {
							name: cate.name,
							type: cate.type,
							'seller-id': user.id
						}
					});
				});
			}
		});
		const operations = [...arr, ...categoryArr].flatMap((doc: any) => [
			{ index: { _index: doc.index, _id: doc.id } },
			doc.data
		]);
		const bulkResponse = await client.bulk({ refresh: true, operations });

		if (bulkResponse.errors) {
			console.log(bulkResponse.errors);
		}

		const count = await client.count({ index: 'products' });
		console.log(count);

		console.log(arr);

		return {
			user
		};
	})
});
