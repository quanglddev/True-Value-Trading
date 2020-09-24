// src/app/core/env.config.ts
// tslint:disable: variable-name

const _isDev = window.location.port.indexOf('4200') > -1;
const getHost = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
};
const apiURI = _isDev ? 'http://localhost:8083/api/' : `/api/`;

export const ENV = {
    BASE_URI: getHost(),
    BASE_API: apiURI,
    schema: [{
        name: 'Date',
        type: 'date',
        format: '%Y/%m/%d %H:%M:%S'
    }, {
        name: 'Open',
        type: 'number'
    }, {
        name: 'High',
        type: 'number'
    }, {
        name: 'Low',
        type: 'number'
    }, {
        name: 'Close',
        type: 'number'
    }, {
        name: 'Volume',
        type: 'number'
    }]
};
