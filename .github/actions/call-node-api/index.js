const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const apiUrl = 'http://localhost:3000/status';

    console.log(`Calling API`);

    // Call the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Validate response
    if (!data.status || !data.service || !data.timestamp) {
      throw new Error('Invalid API response format');
    }

    const statusMarkdown = `## API Status

- **Status**: ${data.status}
- **Service**: ${data.service}
- **Timestamp**: ${data.timestamp}`;

    console.log('Generated Markdown:');

    // Read README.md
    const readmePath = path.join(process.env.GITHUB_WORKSPACE || '.', 'README.md');
    let readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Create backup before changes
    const backupPath = path.join(process.env.GITHUB_WORKSPACE || '.', 'README.md.backup');
    fs.writeFileSync(backupPath, readmeContent, 'utf8');
    console.log('Backup created: README.md.backup');

    // Find and replace content between markers
    const startMarker = '<!-- API_STATUS_START -->';
    const endMarker = '<!-- API_STATUS_END -->';

    const startIndex = readmeContent.indexOf(startMarker);
    const endIndex = readmeContent.indexOf(endMarker);

    // Checking the README for placeholders
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('README.md must contain API_STATUS_START and API_STATUS_END markers');
    }

    const beforeMarker = readmeContent.substring(0, startIndex + startMarker.length);
    const afterMarker = readmeContent.substring(endIndex);
    const newContent = beforeMarker + '\n' + statusMarkdown + '\n' + afterMarker;

    fs.writeFileSync(readmePath, newContent, 'utf8');
    console.log('README.md updated successfully');

    // Clean up backup after successful update
    fs.unlinkSync(backupPath);
    console.log('Backup removed after successful update');

  } catch (error) {
    console.error('❌ Error:', error.message);

    // Restore from backup
    const backupPath = path.join(process.env.GITHUB_WORKSPACE || '.', 'README.md.backup');
    if (fs.existsSync(backupPath)) {
      const readmePath = path.join(process.env.GITHUB_WORKSPACE || '.', 'README.md');
      fs.copyFileSync(backupPath, readmePath);
      console.log('♻️  README.md restored from backup');
      fs.unlinkSync(backupPath);
    }

    process.exit(1);
  }
}

run();
