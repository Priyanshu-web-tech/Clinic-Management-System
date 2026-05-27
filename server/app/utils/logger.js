const { createLogger: createWinstonLogger, transports, format } = require('winston');
require('winston-daily-rotate-file');

const appName = 'Doc Mate';
const writeLogsToFile = process.env.NODE_ENV !== 'production';

const loggerConsole = createWinstonLogger({
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
            level: 'info'
        })
    ]
});

let loggerFile;
if (writeLogsToFile) {
    loggerFile = createWinstonLogger({
        transports: [
            new transports.DailyRotateFile({
                filename: `${appName}_%DATE%.log`,
                datePattern: 'DDMMYYYY',
                format: format.simple(),
                level: 'info',
                maxFiles: '3'
            })
        ]
    });
}

const loggerToConsole = new Proxy({}, {
    get: (_, level) => (message) => {
        loggerConsole[level](`${level === 'error' ? 'SwanError: ' : ''}${message}`);
    }
});

const loggerToFile = writeLogsToFile
    ? new Proxy({}, {
        get: (_, level) => (message) => {
            loggerFile[level](`${new Date().toISOString()} ${message}`);
        }
    })
    : new Proxy({}, { get: () => () => {} });

const logger = new Proxy({}, {
    get: (_, level) => (() => {
        if (writeLogsToFile) {
            return (message) => {
                loggerToConsole[level](message);
                loggerToFile[level](message);
            };
        }
        return loggerToConsole[level];
    })()
});


module.exports = {
    logger,
    loggerToConsole,
    loggerToFile
};
