const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const user = await prisma.user.findFirst({ select: { id: true, username: true } });
    console.log('OK', user);
    process.exit(0);
  } catch (e) {
    console.error('PRISMA ERROR:', e);
    process.exit(1);
  }
})();
