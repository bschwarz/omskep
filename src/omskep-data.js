/** Static variable to hold the statuscodes */
const omskepdata = {
    statuscodes: [
        {code: '200', reasonphrase: 'OK'},
        {code: '201', reasonphrase: 'Created'},
        {code: '202', reasonphrase: 'Accepted'},
        {code: '204', reasonphrase: 'No Content'},
        {code: '300', reasonphrase: 'Multiple Choices'},
        {code: '301', reasonphrase: 'Moved Permanently'},
        {code: '302', reasonphrase: 'Found'},
        {code: '303', reasonphrase: 'See Other'},
        {code: '304', reasonphrase: 'Not Modified'},
        {code: '305', reasonphrase: 'Use Proxy'},
        {code: '307', reasonphrase: 'Temporary Redirect '},
        {code: '308', reasonphrase: 'Permanent Redirect '},
        {code: '400', reasonphrase: 'Bad Request'},
        {code: '401', reasonphrase: 'Unauthorized'},
        {code: '403', reasonphrase: 'Forbidden'},
        {code: '404', reasonphrase: 'Not Found'},
        {code: '405', reasonphrase: 'Method Not Allowed'},
        {code: '406', reasonphrase: 'Not Acceptable'},
        {code: '408', reasonphrase: 'Request Timeout'},
        {code: '409', reasonphrase: 'Conflict'},
        {code: '410', reasonphrase: 'Gone'},
        {code: '411', reasonphrase: 'Length Required'},
        {code: '412', reasonphrase: 'Precondition Failed'},
        {code: '413', reasonphrase: 'Payload Too Large'},
        {code: '414', reasonphrase: 'URI Too Long'},
        {code: '415', reasonphrase: 'Unsupported Media Type'},
        {code: '416', reasonphrase: 'Range Not Satisfiable'},
        {code: '417', reasonphrase: 'Expectation Failed'},
        {code: '426', reasonphrase: 'Upgrade Required'},
        {code: '428', reasonphrase: 'Precondition Required'},
        {code: '429', reasonphrase: 'Too Many Requests'},
        {code: '431', reasonphrase: 'Request Header Fields Too Large'},
        {code: '500', reasonphrase: 'Internal Server Error'},
        {code: '501', reasonphrase: 'Not Implemented'},
        {code: '502', reasonphrase: 'Bad Gateway'},
        {code: '503', reasonphrase: 'Service Unavailable'},
        {code: '504', reasonphrase: 'Gateway Timeout'},
        {code: 'default', reasonphrase: ''}
    ],
    httpMethodColors: [
        {name: 'get', color: '#009fdb', heading: 'GET'},
        {name: 'post', color: '#007a3e', heading: 'POST'},
        {name: 'put', color: '#bb5d00', heading: 'PUT'},
        {name: 'delete', color: '#cf2a2a', heading: 'DELETE'},
        {name: 'patch', color: '#b5bd00', heading: 'PATCH'},
        {name: 'head', color: '#9012fe', heading: 'HEAD'},
        {name: 'options', color: '#0d5aa7', heading: 'OPTIONS'}
    ]
}

module.exports = {
    omskepdata: omskepdata
}