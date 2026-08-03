import urllib.request
import json
import os

with open('/Users/ashishdeotripathi/.gemini/antigravity-ide/brain/d0ab75d3-3a0e-4057-ad6d-728c12ec335f/.system_generated/steps/5/output.txt', 'r') as f:
    data = json.load(f)

targets = {
  'Main App Layout (Dark Mode Toggle) - TabFlow': 'main_layout.html',
  'Auth Page (Dark Mode Toggle) - TabFlow': 'auth_page.html',
  'TabNexus Command Center (Dark Mode + Toggle)': 'command_center.html',
  'Advanced Search & Discovery (Dark Mode + Toggle)': 'search_discovery.html',
  'Bastion: Semantic Discovery (Dark Mode + Toggle)': 'semantic_discovery.html',
  'theme.css rules': 'theme.css'
}

os.makedirs('scratch/screens', exist_ok=True)

for screen in data['screens']:
    if screen['title'] in targets:
        url = screen['htmlCode']['downloadUrl']
        filename = targets[screen['title']]
        print(f"Downloading {screen['title']} -> {filename}")
        urllib.request.urlretrieve(url, f"scratch/screens/{filename}")

print("Done!")
