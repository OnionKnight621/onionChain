import crypto from "crypto";

const cryptoHash = (...inputs: any[]) => {
    const hash = crypto.createHash('sha256');

    hash.update(inputs.map(input => JSON.stringify(input)).sort().join('_'));

    return hash.digest('hex');
};

export default cryptoHash;
