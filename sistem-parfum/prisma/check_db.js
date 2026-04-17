const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const perfumes = await prisma.perfumes.findMany({
        take: 5
    });
    console.log(JSON.stringify(perfumes, null, 2));
    await prisma.$disconnect();
}

main();
