const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash a password
async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return (hashedPassword);
    } catch (error) {
        // Handle error, for example, send an error response
        res.status(500).send('Internal Server Error from hashing passowrd' );
    }
}

// Compare a password with a hash
async function comparePassword(password, hash) {
    try {
        const hashedPassword = await bcrypt.compare(password, hash)
        if (!hashedPassword) {
            return false;
        }
        return true;
    } catch (error) {
        return('Internal Server Error from comparing passowrd' );
    }
}


module.exports = { hashPassword, comparePassword }