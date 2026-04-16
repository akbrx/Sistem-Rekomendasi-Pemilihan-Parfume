import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Prisma schema maps table 'perfumes' to model perfumes
        const records = await prisma.perfumes.findMany({
            select: {
                olfactory_family: true
            },
            distinct: ['olfactory_family']
        });

        const families = records.map((r: any) => r.olfactory_family).filter(Boolean);

        return NextResponse.json({ success: true, families });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Database error', error: e.message }, { status: 500 });
    }
}
