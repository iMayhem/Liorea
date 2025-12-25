
import fs from 'fs';
import path from 'path';

const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
const outputPath = path.join(process.cwd(), 'src/lib/changelog-data.json');

function parseChangelog() {
    try {
        if (!fs.existsSync(changelogPath)) {
            console.warn('CHANGELOG.md not found, skipping generation.');
            fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
            return;
        }

        const content = fs.readFileSync(changelogPath, 'utf-8');
        const versions = [];
        const versionRegex = /## \[(.+?)\] - (.+?)$/gm;

        let match;
        const matches = [];

        while ((match = versionRegex.exec(content)) !== null) {
            matches.push({
                version: match[1],
                date: match[2],
                index: match.index
            });
        }

        // Extract content between version headers
        for (let i = 0; i < matches.length; i++) {
            const current = matches[i];
            const next = matches[i + 1];

            const startIndex = current.index;
            const endIndex = next ? next.index : content.length;
            const versionContent = content.substring(startIndex, endIndex).trim();

            versions.push({
                version: current.version,
                date: current.date,
                content: versionContent
            });
        }

        fs.writeFileSync(outputPath, JSON.stringify(versions, null, 2));
        console.log(`Changelog data generated at ${outputPath}`);
    } catch (error) {
        console.error('Error generating changelog data:', error);
        process.exit(1);
    }
}

parseChangelog();
