import type { Component } from 'svelte';
import { publishedOnly } from '$lib/postPublish';

interface PostMetadata {
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
	labs_tool?: string;
}

interface Post {
	metadata: PostMetadata;
	default: Component;
}

export async function load() {
	const posts = import.meta.glob('$lib/posts/*.svx', { eager: true }) as Record<string, Post>;

	const allPosts = Object.entries(posts).map(([path, post]) => {
		const slug = path.split('/').pop()?.replace('.svx', '');
		return {
			...post.metadata,
			slug,
			path: `/blog/${slug}`
		};
	});

	// Only published posts, then sort by date descending, take latest 3.
	// Without the gate a future-dated post lands on the homepage as "latest".
	const latestPosts = publishedOnly(allPosts)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 3);

	return { posts: latestPosts };
}
