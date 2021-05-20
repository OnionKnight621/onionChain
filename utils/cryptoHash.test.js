const cryptoHash = require('./cryptoHash');

describe('cryptoHash()', () => {

    it('should generate SHA256 hashed output', () => {
        expect(cryptoHash('test'))
            .toEqual("9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08".toLowerCase());

    });

    it('should produce the same hash with the same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });
});