const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const perfumes = await prisma.perfumes.findMany();
    
    let sumSqSillage = 0;
    let sumSqProjection = 0;
    let sumSqLongevity = 0;
    let sumSqPrice = 0;
    
    for (const p of perfumes) {
        sumSqSillage += Math.pow(Number(p.sillage), 2);
        sumSqProjection += Math.pow(Number(p.projection), 2);
        sumSqLongevity += Math.pow(Number(p.longevity), 2);
        sumSqPrice += Math.pow(Number(p.price), 2);
    }
    
    const divSillage = Math.sqrt(sumSqSillage);
    const divProjection = Math.sqrt(sumSqProjection);
    const divLongevity = Math.sqrt(sumSqLongevity);
    const divPrice = Math.sqrt(sumSqPrice);
    
    console.log("--- Divider Dari Database (73 Data) ---");
    console.log("Sillage:", divSillage);
    console.log("Projection:", divProjection);
    console.log("Longevity:", divLongevity);
    console.log("Price:", divPrice);
    
    const alpha = perfumes.find(p => p.name === 'Alpha');
    if (alpha) {
        console.log("\n--- Alpha Normalized (Database Values) ---");
        console.log("Sillage:", alpha.sillage / divSillage);
        console.log("Projection:", alpha.projection / divProjection);
        console.log("Longevity:", alpha.longevity / divLongevity);
        console.log("Price:", alpha.price / divPrice);
        console.log("\nRaw Values Alpha di DB:");
        console.log(alpha);
    }
    
    await prisma.$disconnect();
}

main();
