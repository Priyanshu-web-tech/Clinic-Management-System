const bcrypt = require('bcryptjs');

exports.generateHash = async (password) => {
    try {
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND));
        const hash = await bcrypt.hash(password.toString(), salt);
        return hash;
    }
    catch (err) {
        return err;
    }
};

exports.comparePassword = async (password, hash) => await bcrypt.compare(password, hash);