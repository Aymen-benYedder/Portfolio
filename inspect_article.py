from pathlib import Path
for path in Path('blog').glob('*.html'):
    text = path.read_text(encoding='utf-8')
    start = r'\ \ <script\ type="application/ld\+json">'
    end = r'\ \ </script>'
    idx = text.find(start)
    if idx != -1:
        close_idx = text.find(end, idx)
        print(path.name, 'start idx', idx, 'close idx', close_idx)
        if close_idx != -1:
            print('segment repr:', repr(text[idx:close_idx+len(end)]))
    else:
        print(path.name, 'no marker')
