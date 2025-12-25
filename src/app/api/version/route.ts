import { NextResponse } from 'next/server';
import { getLatestVersion } from '@/lib/changelog';

export async function GET() {
    try {
        const version = getLatestVersion();
        return NextResponse.json({ version });
    } catch (error) {
        return NextResponse.json({ version: '1.0.1' }, { status: 500 });
    }
}
