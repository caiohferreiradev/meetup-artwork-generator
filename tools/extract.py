"""Extracts translatable strings (msgid, context) from the plugin PHP files."""
import re, sys, glob, os
root = sys.argv[1]
pat = re.compile(r"""\b(__|_e|esc_html__|esc_html_e|esc_attr__|esc_attr_e|_x|esc_html_x|esc_attr_x)\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'\s*,\s*)?'meetup-artwork-generator'""")
found = []
for f in sorted(glob.glob(os.path.join(root, '**/*.php'), recursive=True)):
    if '/languages/' in f: continue
    for m in pat.finditer(open(f).read()):
        fn, s, ctx = m.groups()
        s = s.replace("\\'", "'")
        key = (s, ctx if fn.endswith('_x') else None)
        if key not in found: found.append(key)
if __name__ == '__main__':
    for s, c in found: print(repr((s, c)))
    print(len(found), file=sys.stderr)
