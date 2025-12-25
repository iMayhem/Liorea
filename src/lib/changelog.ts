import changelogData from './changelog-data.json';

export interface ChangelogVersion {
    version: string;
    date: string;
    content: string;
}

export function parseChangelog(): ChangelogVersion[] {
    return changelogData as ChangelogVersion[];
}

export function getLatestVersion(): string {
    const versions = parseChangelog();
    return versions.length > 0 ? versions[0].version : '1.0.0';
}
