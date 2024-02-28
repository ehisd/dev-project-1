const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers(){
    return await prisma.User.findMany();

}

async function main() {
    const users = await getUsers();
    console.log(users);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
