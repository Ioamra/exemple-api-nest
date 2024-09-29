import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import fs from 'fs';
import { config as testing_config } from '../../../test/testing-config';
import { config } from '../../config/config';

@Injectable()
export class GetJwtInfoService {
  constructor(private readonly jwtService: JwtService) {}
  getIdUserAccountJwt(token: string): number {
    const { id } = this.jwtService.verify(token.split(';')[0].split('=')[1].replace('Bearer%20', ''), {
      secret: fs.readFileSync(config().jwt.private || testing_config().jwt.private, 'utf8'),
      algorithms: [config().jwt.algorithm || (testing_config().jwt.algorithm as 'RS256')],
    });
    return id;
  }

  getFullNameUserJwt(token: string): string {
    const { firstname, lastname } = this.jwtService.verify(token.split(';')[0].split('=')[1].replace('Bearer%20', ''), {
      secret: fs.readFileSync(config().jwt.private || testing_config().jwt.private, 'utf8'),
      algorithms: [config().jwt.algorithm || (testing_config().jwt.algorithm as 'RS256')],
    });
    return firstname + ' ' + lastname;
  }

  getFirstNameUserJwt(token: string): string {
    const { firstname } = this.jwtService.verify(token.split(';')[0].split('=')[1].replace('Bearer%20', ''), {
      secret: fs.readFileSync(config().jwt.private || testing_config().jwt.private, 'utf8'),
      algorithms: [config().jwt.algorithm || (testing_config().jwt.algorithm as 'RS256')],
    });
    return firstname;
  }

  getLastNameUserJwt(token: string): string {
    const { lastname } = this.jwtService.verify(token.split(';')[0].split('=')[1].replace('Bearer%20', ''), {
      secret: fs.readFileSync(config().jwt.private || testing_config().jwt.private, 'utf8'),
      algorithms: [config().jwt.algorithm || (testing_config().jwt.algorithm as 'RS256')],
    });
    return lastname;
  }

  getMailUserJwt(token: string): string {
    const { mail } = this.jwtService.verify(token.split(';')[0].split('=')[1].replace('Bearer%20', ''), {
      secret: fs.readFileSync(config().jwt.private || testing_config().jwt.private, 'utf8'),
      algorithms: [config().jwt.algorithm || (testing_config().jwt.algorithm as 'RS256')],
    });
    return mail;
  }
}
