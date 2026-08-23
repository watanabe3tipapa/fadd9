#!/usr/bin/env python3
"""Validate ABC snippets in data/samples.json: bar durations must match meter."""
import json, re, sys

TOKEN_RE = re.compile(
    r'^(?:[\^_=]{1,2})?(z|Z|x|[A-Ga-g][,\']*|\[[^\]]*\])(\d+)?(?:/(\d+))?$')

def parse_meter(m):
    m = m.strip()
    if m == 'C': return (4, 4)
    if m == 'C|': return (2, 4)
    a, b = m.split('/')
    return (int(a), int(b))

def seg_durations(seg):
    """Return list of note durations (in whole-note units) for one bar segment."""
    seg = re.sub(r'\s*([<>])\s*', r' \1 ', seg)  # isolate broken rhythm marks
    toks = [t for t in re.split(r'\s+', seg) if t]
    durs, ops = [], []
    for t in toks:
        if t in ('>', '<'):
            ops.append((t, len(durs)))
            continue
        m = TOKEN_RE.match(t)
        if not m:
            raise ValueError(f"unparsable token '{t}'")
        num = int(m.group(2) or 1)
        den = int(m.group(3) or 1)
        durs.append(num / den)
    # resolve broken rhythm after '>' / '<'
    for op, pos in ops:
        if pos >= len(durs) or pos == 0:
            raise ValueError(f"broken rhythm '{op}' at invalid position")
        if op == '>':
            durs[pos - 1] *= 1.5; durs[pos] *= 0.5
        else:
            durs[pos - 1] *= 0.5; durs[pos] *= 1.5
    return durs

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else 'data/samples.json'
    data = json.load(open(path))
    failures = 0
    for s in data['samples']:
        abc = s['abc']
        slug = s['slug']
        try:
            num, den = parse_meter(re.search(r'^M:(.+)$', abc, re.M).group(1))
            L = re.search(r'^L:(.+)$', abc, re.M).group(1).strip()
            lnum, lden = map(int, L.split('/'))
            default_len = lnum / lden
            kline = re.search(r'^K:.+$', abc, re.M).group(0)
            body = abc.split(kline, 1)[1]
        except AttributeError:
            print(f"[FAIL] {slug}: missing M:/L:/K:"); failures += 1; continue

        body = re.sub(r'^[A-Za-z]:.*$', '', body, flags=re.M)   # mid-tune fields (N:)
        body = re.sub(r'"[^"]*"', '', body)                     # chord symbols
        for rep in ('|]', '||', ':|', '|:', '::'):
            body = body.replace(rep, '|')
        expected = num / den

        segs = body.split('|')
        problems = []
        pickup_seen = False
        for idx, seg in enumerate(segs):
            if not seg.strip():
                continue
            try:
                durs = [d * default_len for d in seg_durations(seg)]
            except ValueError as e:
                problems.append(f"bar {idx}: {e}")
                continue
            total = sum(durs)
            if abs(total - expected) > 1e-9:
                if idx == 0 and not pickup_seen and total < expected:
                    pickup_seen = True  # anacrusis is legitimate
                else:
                    problems.append(f"bar {idx}: {total:g} != {expected:g}")
        if problems:
            failures += 1
            print(f"[FAIL] {slug}")
            for p in problems:
                print(f"       {p}")
        else:
            note = " (pickup)" if pickup_seen else ""
            n_bars = sum(1 for seg in segs if seg.strip())
            print(f"[ OK ] {slug}: {n_bars} bars @ {num}/{den}, L:{lnum}/{lden}{note}")
    print('---')
    print('ALL VALID' if failures == 0 else f'{failures} SAMPLE(S) FAILED')
    sys.exit(1 if failures else 0)

if __name__ == '__main__':
    main()
