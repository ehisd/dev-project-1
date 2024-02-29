const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ['error']
});

//Register a new user
async function registerUser(req, res){
  try{
    const user = await prisma.user.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      },
    });
    res.status(201).json(user);
  }catch(error){
    console.error('Prisma Error', error);
    res.status(400).json({Error: error.message});
  }
};

//Login a user
async function loginUser(req, res){
  try{
    const user = await prisma.user.findUnique({
      where : {
        email: req.body.email,
      },
    });
    if(user.password === req.body.password){
      res.status(200).json(user);
    }
  }catch(error){
    res.status(400).json({Error: error.message});
  }
}



