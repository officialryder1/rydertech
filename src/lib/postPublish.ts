/**
 * Publish-date gating for blog posts.
 *
 * A post's `date` frontmatter is a PUBLISH date, not a label: a post dated in the
 * future must not appear in any listing, must not be reachable at its URL, and must
 * not be in the sitemap until that day arrives.
 *
 * Gating is evaluated at REQUEST time, not build time. The blog route group is
 * therefore server-rendered (no `prerender = true`): a build-time gate would bake
 * the publish set into static HTML and every drip date would need a redeploy.
 *
 * Dates are compared as `YYYY-MM-DD` strings — lexicographic order on that shape is
 * chronological order, and it avoids server-timezone drift (Vercel runs UTC, but a
 * `new Date(y, m, d)` comparison would silently depend on it).
 */

/** Normalise a frontmatter date to a `YYYY-MM-DD` key, or '' when unparseable. */
export function toDateKey(value: string | Date | undefined | null): string {
	if (!value) return '';
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
	}
	// "2026-10-15", "2026-10-15T09:00:00Z", or a quoted variant already unwrapped by mdsvex
	const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (match) return `${match[1]}-${match[2]}-${match[3]}`;
	const parsed = new Date(String(value));
	return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

/**
 * True once the post's publish day has started. A post dated today is live today.
 * Fails OPEN (returns true) on a missing/unparseable date so a typo can never
 * silently unpublish an existing post.
 */
export function isPublished(date: string | Date | undefined | null, now: Date = new Date()): boolean {
	const key = toDateKey(date);
	if (!key) return true;
	return key <= toDateKey(now);
}

/** Filter a post list down to those whose publish date has arrived. */
export function publishedOnly<T extends { date?: string | Date }>(
	posts: T[],
	now: Date = new Date()
): T[] {
	return posts.filter((post) => isPublished(post.date, now));
}
