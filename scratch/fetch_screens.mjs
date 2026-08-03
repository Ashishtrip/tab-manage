import fs from 'fs';

const output = JSON.parse(fs.readFileSync('/Users/ashishdeotripathi/.gemini/antigravity-ide/brain/d0ab75d3-3a0e-4057-ad6d-728c12ec335f/.system_generated/steps/5/output.txt', 'utf8'));

const targets = {
  'Main App Layout (Dark Mode Toggle) - TabFlow': 'main_layout.html',
  'Auth Page (Dark Mode Toggle) - TabFlow': 'auth_page.html',
  'TabNexus Command Center (Dark Mode + Toggle)': 'command_center.html',
  'Advanced Search & Discovery (Dark Mode + Toggle)': 'search_discovery.html',
  'Bastion: Semantic Discovery (Dark Mode + Toggle)': 'semantic_discovery.html',
  'theme.css rules': 'theme.css'
};

if (!fs.existsSync('scratch/screens')) {
  fs.mkdirSync('scratch/screens', { recursive: true });
}

async function run() {
  for (const screen of output.screens) {
    if (targets[screen.title]) {
      const url = screen.htmlCode.downloadUrl;
      const filename = targets[screen.title];
      console.log(`Fetching ${screen.title} -> ${filename}`);
      try {
        const response = await fetch(url);
        const text = await response.text();
        fs.writeFileSync(`scratch/screens/${filename}`, text);
      } catch (err) {
        console.error("Failed to fetch", filename, err);
      }
    }
  }
  console.log('Done!');
}
run();
