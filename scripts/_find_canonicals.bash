#!/bin/bash
# find all canonical + apex-origin references in source
echo "=== files mentioning 'canonical' ==="
grep -rln "canonical" /c/Users/HP/Documents/web\ development/personal\ project/rydertech/src/ 2>/dev/null
echo
echo "=== all apex-origin strings (rydertech.ng, no www) ==="
grep -rn "https://rydertech.ng" /c/Users/HP/Documents/web\ development/personal\ project/rydertech/src/ 2>/dev/null | head -30
