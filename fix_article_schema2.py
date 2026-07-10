import re
from pathlib import Path

SCRIPT_BLOCK_RE = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.DOTALL)
ARTICLE_RE = re.compile(r'"@type"\s*:\s*"Article"')
INVALID_ESCAPE_RE = re.compile(r'\\([^"\\/bfnrtu])')


def clean_invalid_json_escapes(json_text: str) -> str:
    return INVALID_ESCAPE_RE.sub(r'\1', json_text)


for path in Path('blog').glob('*.html'):
    text = path.read_text(encoding='utf-8')
    updated = [False]

    def replace_block(match):
        prefix, inner, suffix = match.groups()
        if ARTICLE_RE.search(inner):
            cleaned_inner = clean_invalid_json_escapes(inner)
            if cleaned_inner != inner:
                updated[0] = True
                return prefix + cleaned_inner + suffix
        return match.group(0)

    new_text = SCRIPT_BLOCK_RE.sub(replace_block, text)
    if updated[0]:
        path.write_text(new_text, encoding='utf-8')
        print(f'Updated {path.name}')
