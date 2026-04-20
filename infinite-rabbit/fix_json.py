import re
import json

with open('assetsData.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix double comma issues
fixed_text = re.sub(r'",\s*,\s*"panda_idle"', '",\n"panda_idle"', text)

with open('assetsData.js', 'w', encoding='utf-8') as f:
    f.write(fixed_text)

print("Double comma fixed!")

# Verify JSON
try:
    json_str = fixed_text[fixed_text.find('{'):fixed_text.rfind('}')+1]
    data = json.loads(json_str)
    print("Valid JSON! Keys:", list(data.keys()))
except Exception as e:
    print("Still failed to parse JSON:", e)
