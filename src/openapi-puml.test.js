const fs = require('fs');
const puml = require('./omskep-puml.js');

let diag = null;

beforeEach(() => {
    let data = fs.readFileSync('examples/petstore-openapi3.json', 'utf8');
    diag = new puml.Puml(data);
});

test('Get Title of the Openapi Definition', () => {
    expect(diag.getTitle()).toBe('Swagger Petstore');
});