const fs = require('fs');
const { Puml } = require('./omskep-puml.js');

let diag = null;

beforeEach(() => {
    let data = fs.readFileSync('examples/petstore-openapi3.json', 'utf8');
    diag = new Puml(data);
});

test('Get Title of the Openapi Definition', () => {
    expect(diag.getTitle()).toBe('Swagger Petstore');
});
test('Set and Get Puml Theme', () => {
    diag.theme = 'sandstone';
    let str = '!include https://raw.githubusercontent.com/bschwarz/puml-themes/master/themes/sandstone/puml-theme-sandstone.puml';
    expect(diag.theme).toBe(str);
});
test('Set and Get Non Puml Theme', () => {
    diag.theme = 'sandstoneX';
    let str = '!include sandstoneX';
    expect(diag.theme).toBe(str);
});