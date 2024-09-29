import winston, { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class CustomLoggerService {
  private logger: winston.Logger;

  filterError = format((info) => {
    return info.level === 'error' ? info : false;
  });

  filterWarn = format((info) => {
    return info.level === 'warn' ? info : false;
  });

  filterDebug = format((info) => {
    return info.level === 'debug' ? info : false;
  });

  filterUser = format((info) => {
    return info.level === 'user' ? info : false;
  });

  filterCron = format((info) => {
    return info.level === 'cron' ? info : false;
  });

  filterMail = format((info) => {
    return info.level === 'mail' ? info : false;
  });

  filterInfo = format((info) => {
    return info.level === 'info' ? info : false;
  });
  constructor() {
    const customFormat = format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`);

    const logLevels = {
      error: 0,
      warn: 1,
      debug: 2,
      info: 3,
      user: 4,
      cron: 5,
      mail: 6,
    };

    const colors = {
      error: 'red',
      warn: 'yellow',
      debug: 'blue',
      info: 'cyan',
      user: 'green',
      cron: 'magenta',
      mail: 'grey',
    };

    winston.addColors(colors);

    const createLoggerConfig = {
      levels: logLevels,
      level: 'mail',
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/error%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          level: 'error',
          frequency: '5m',
          format: format.combine(
            this.filterError(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/warn%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          level: 'warn',
          frequency: '5m',
          format: format.combine(
            this.filterWarn(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/debug%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          level: 'debug',
          frequency: '5m',
          format: format.combine(
            this.filterDebug(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/user%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          level: 'user',
          frequency: '5m',
          format: format.combine(
            this.filterUser(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/cron%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          level: 'cron',
          frequency: '5m',
          format: format.combine(
            this.filterCron(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/mail%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          level: 'mail',
          frequency: '5m',
          format: format.combine(
            this.filterMail(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/info%DATE%.log',
          datePattern: 'DD-MM-YYYY-HH-mm',
          frequency: '5m',
          level: 'info',
          format: format.combine(
            this.filterInfo(),
            format.timestamp({
              format: 'DD-MM-YYYY hh:mm:ss',
            }),
            customFormat,
          ),
        }),
      ],
    };

    this.logger = winston.createLogger(createLoggerConfig);
  }

  log(level: string, message: string) {
    if (!this.logger.levels[level]) {
      message = level;
      level = 'info';
    }
    this.logger.log(level, message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  user(message: string) {
    this.logger.log('user', message);
  }

  cron(message: string) {
    this.logger.log('cron', message);
  }

  mail(message: string) {
    this.logger.log('mail', message);
  }

  info(message: string) {
    this.logger.info(message);
  }
}
