"""Upgrade the approved native edit to 1920×1080 without changing its timing."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--asset-id', default='toykit-1080-v4')
parser.add_argument('--output-prefix', default='hd')
args = parser.parse_args()
root = Path(__file__).resolve().parent
work = root/'.tesseract-work/v4'
document = json.loads((work/'native-before.json').read_text())
document['dimensions'] = dict(width=1920, height=1080)
document['composition']['name'] = 'Kinbuild — the pieces become a team / native 1080p'
for layer in document['composition']['layers']:
    if layer['type'] == 'Video':
        layer['source']['assetId'] = args.asset_id
        layer['name'] = 'Native 1920×1080 3D toy-kit footage'
        layer['transform']['anchorPoint'] = [960,540]
        layer['transform']['position'] = [960,540]
        layer['transform']['scale'] = [100,100]
    elif layer['type'] == 'Text':
        for key in ['anchorPoint','position']:
            layer['transform'][key] = [v*1.5 for v in layer['transform'][key]]
        text = layer['sourceText']
        for key in ['fontSize','leading','strokeWidth','baselineShift']:
            if key in text:
                text[key] *= 1.5
        for key in ['boxSize','boxPosition']:
            text[key] = [v*1.5 for v in text[key]]
for entry in document['composition']['dynamics']['entries']:
    if entry['target'].get('propertyType') in ['positionX','positionY']:
        old = entry['animator']['layerTimeJsCode']
        entry['animator']['layerTimeJsCode'] = 'return 1.5*(function(){'+old+'})();'
(work/f'{args.output_prefix}-editable.json').write_text(json.dumps(document,indent=2)+'\n')
print('Native 1080p edit; existing timings, text and audio preserved.')
