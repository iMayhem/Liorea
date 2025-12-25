import fs from 'fs';
import path from 'path';

export interface ChangelogVersion {
    version: string;
    date: string;
    content: string;
}

export function parseChangelog(): ChangelogVersion[] {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf-8');

    const versions: ChangelogVersion[] = [];
    const versionRegex = /## \[(.+?)\] - (.+?)$/gm;

    let match;
    const matches: Array<{ version: string; date: string; index: number }> = [];

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

    return versions;
}

export function getLatestVersion(): string {
    const versions = parseChangelog();
    return versions.length > 0 ? versions[0].version : '1.0.0';
}
