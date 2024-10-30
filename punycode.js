const punycode = require('punycode/');

// 예시: Punycode 인코딩
const encoded = punycode.encode('안녕하세요');
console.log(encoded);

// 예시: Punycode 디코딩
const decoded = punycode.decode(encoded);
console.log(decoded);