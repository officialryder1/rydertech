import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';

export interface PostMetadata {
	title: string;
	description?: string;
	date: string | Date;
	author?: string;
	slug: string;
	category: string;
	readTime: string;
	excerpt: string;
	tags?: string[];
	image?: string;
	views?: number;
	comments?: number;
}

export interface Post {
	metadata: PostMetadata;
	default: Component;
}

export async function load({ params }): Promise<{ post: Post; slug: string }> {
	const posts = import.meta.glob('$lib/posts/*.svx') as Record<string, () => Promise<Post>>;
	if (!posts) {
		error(404, 'No posts found');
	}

	for (const [path, resolver] of Object.entries(posts)) {
		const slug = path.split('/').pop()?.replace('.svx', '');

		if (slug === params.slug) {
			const post = await resolver();

			return {
				post,
				slug
			};
		}
	}

	error(404, 'Post not found');
}
