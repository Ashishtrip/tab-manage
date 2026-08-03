import fs from 'fs';

const targets = {
  'main_layout.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1N2Q1YTdkMzdiZTgwN2M0ZWMwYjc1MDYzNDQ0EgsSBxC14Pf3iQUYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTIyMDk2Nzc4NDc0MjIyMzkw&filename=&opi=89354086',
  'auth_page.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1N2Q1YTU0ODk2NDkwODlhZjVmOTQzMDJhZmZmEgsSBxC14Pf3iQUYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTIyMDk2Nzc4NDc0MjIyMzkw&filename=&opi=89354086',
  'command_center.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1ODE1Nzk1N2M4YzMwMWE2MzFjZWYwM2QwZjdiEgsSBxC14Pf3iQUYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTIyMDk2Nzc4NDc0MjIyMzkw&filename=&opi=89354086',
  'search_discovery.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1ODE1N2EwYTk4NDYwNjM5NTE5NmFlMzQyMWI5EgsSBxC14Pf3iQUYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTIyMDk2Nzc4NDc0MjIyMzkw&filename=&opi=89354086',
  'semantic_discovery.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1ODE1NzkzMTEzOWMwMmQzYzU4OTBlMWI3ZmViEgsSBxC14Pf3iQUYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTIyMDk2Nzc4NDc0MjIyMzkw&filename=&opi=89354086',
  'theme.css': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1N2I5MzA4NjQ4YjMwMDMwMzZjNzIwMGEwMWY3EgsSBxC14Pf3iQUYAZIBIwoKcHJvamVjdF9pZBIVQhMzMTIyMDk2Nzc4NDc0MjIyMzkw&filename=&opi=89354086'
};

if (!fs.existsSync('scratch/screens')) {
  fs.mkdirSync('scratch/screens', { recursive: true });
}

async function run() {
  for (const [filename, url] of Object.entries(targets)) {
    console.log(`Fetching ${filename}...`);
    try {
      const response = await fetch(url);
      const text = await response.text();
      fs.writeFileSync(`scratch/screens/${filename}`, text);
    } catch (err) {
      console.error("Failed to fetch", filename, err);
    }
  }
  console.log('Done!');
}
run();
