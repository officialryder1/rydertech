npx vite build > /tmp/vite_ok3.txt 2>&1
echo "BUILD_EXIT=$?"
grep -iE "error|ARIA|aria|a11y|built in|symlink|EPERM" /tmp/vite_ok3.txt | head -20
grep -iE "terms|_page.svelte.js" /tmp/vite_ok3.txt | tail -3
