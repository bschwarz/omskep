const fs = require('fs');
const puml = require('./omskep-puml.js');
// const openapi = require('./omskep-openapi.js');

test('Get Title of the Openapi Definition', () => {
    let data = fs.readFileSync('examples/petstore-openapi3.json', 'utf8');
    diag = new puml.Puml(data);
    console.log(diag.getTitle());
    expect(diag.getTitle()).toBe('Swagger Petstore');
});