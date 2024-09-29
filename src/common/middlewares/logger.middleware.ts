import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs';
import { config as testing_config } from '../../../test/testing-config';
import { config } from '../../config/config';
import { CustomLoggerService } from '../services/customLogger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  use(req: FastifyRequest, res: FastifyReply, next: Function) {
    if (req && req.headers.cookie) {
      const token = req.headers.cookie.split(';')[0].split('=')[1].replace('Bearer%20', '');
      if (token) {
        try {
          const decoded = this.jwtService.verify<{ id: number; firstname: string; lastname: string; mail: string; iat: number }>(token, {
            secret: fs.readFileSync(config().jwt.private || testing_config().jwt.private, 'utf8'),
            algorithms: [config().jwt.algorithm || (testing_config().jwt.algorithm as 'RS256')],
          });
          const { id, firstname, lastname } = decoded;
          this.logger.log('info', `User [${id}] ${firstname} ${lastname} is making a request to [${req.method}]${req.originalUrl}`);
        } catch (err) {
          this.logger.log('error', `Invalid token, ${err.message}`);
        }
      }
    }

    next();
  }
}
