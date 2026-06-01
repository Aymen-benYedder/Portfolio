import re
import json
from pathlib import Path

for path in Path('blog').glob('*.html'):
    text = path.read_text(encoding='utf-8')
    if '"@type": "Article"' not in text:
        continue

    canonical_m = re.search(r'<link rel="canonical" href="([^"]+)"', text)
    headline_m = re.search(r'"headline":\s*"([^"]+)"', text)
    description_m = re.search(r'"description":\s*"([^"]+)"', text)
    published_m = re.search(r'"datePublished":\s*"([^"]+)"', text)
    modified_m = re.search(r'"dateModified":\s*"([^"]+)"', text)
    image_m = re.search(r'"url":\s*"(https://[^"]+assets/img/[^"]+)"', text)

    if not (canonical_m and headline_m and description_m and published_m):
        continue

    canonical = canonical_m.group(1)
    headline = headline_m.group(1)
    description = description_m.group(1)
    date_published = published_m.group(1)
    date_modified = modified_m.group(1) if modified_m else date_published
    image_url = image_m.group(1) if image_m else 'https://aymen.benyedder.top/assets/img/preview.webp'
    article_id = f"{canonical}#featured-article"

    data = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": article_id,
        "headline": headline,
        "description": description,
        "image": image_url,
        "author": {"@id": "https://aymen.benyedder.top/#person"},
        "publisher": {"@id": "https://aymen.benyedder.top/#organization"},
        "mainEntityOfPage": {"@id": canonical},
        "datePublished": date_published,
        "dateModified": date_modified,
        "keywords": "DevOps, CI/CD, Docker, MERN stack, infrastructure automation",
        "articleSection": ["DevOps", "Infrastructure", "CI/CD", "Cloud Architecture"],
        "inLanguage": "en",
        "isAccessibleForFree": "True",
        "author_name": "Aymen ben Yedder",
        "publisher_name": "AYMEN.DEV"
    }

    json_text = '<script type="application/ld+json">\n' + json.dumps(data, indent=2, ensure_ascii=False) + '\n  </script>'

    def repl(match):
        block = match.group(0)
        if '"@type": "Article"' in block:
            return json_text
        return block

    new_text = re.sub(r'<script type="application/ld\+json">[\s\S]*?<\/script>', repl, text, count=1)

    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'Updated: {path.name}')
