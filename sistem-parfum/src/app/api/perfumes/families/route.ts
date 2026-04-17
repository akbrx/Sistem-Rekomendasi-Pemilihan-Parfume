import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Prisma schema maps table 'perfumes' to model perfumes
        const records = await prisma.perfumes.findMany({
            select: {
                olfactory_family: true
            }
        });

        const familySet = new Set<string>();
        records.forEach((r: any) => {
            if (r.olfactory_family) {
                // Hapus teks dalam kurung, misal "(Saffron + Leather)"
                let cleaned = r.olfactory_family.replace(/\(.*?\)/g, '').trim();
                // Pecah berdasarkan koma (,) dan garis miring (/)
                const parts = cleaned.split(/[\/,]/).map((f: string) => f.trim());
                parts.forEach((f: string) => {
                    if (f) familySet.add(f);
                });
            }
        });

        // Konversi Set kembali menjadi Array dan urutkan sesuai abjad
        const families = Array.from(familySet).sort();

        return NextResponse.json({ success: true, families });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: 'Database error', error: e.message }, { status: 500 });
    }
}
