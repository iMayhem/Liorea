import { NextResponse } from 'next/server';
import { parseChangelog } from '@/lib/changelog';

export async function GET() {
    try {
        const versions = parseChangelog();
        return NextResponse.json({ versions });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to parse changelog' }, { status: 500 });
    }
}
