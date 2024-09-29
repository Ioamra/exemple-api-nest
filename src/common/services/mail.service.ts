import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { config as testing_config } from '../../../test/testing-config';
import { config } from '../../config/config';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
    host: config().nodemailer.host || testing_config().nodemailer.host,
    port: config().nodemailer.port || testing_config().nodemailer.port,
    secure: config().nodemailer.secure || testing_config().nodemailer.secure,
    auth: {
      user: config().nodemailer.auth.user || testing_config().nodemailer.auth.user,
      pass: config().nodemailer.auth.pass || testing_config().nodemailer.auth.pass,
    },
  } as SMTPTransport.Options);

  async forgotPassword(mail: string, link: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: '"Paddock One" <ne_pas_repondre@paddock-one.com>',
        to: config().nodemailer.mailDev || mail,
        subject: 'Mot de passe oublié',
        text: `
        Des difficultés à se connecter?\n
        Réinitialiser ton mot de passe est facile.\n
        Appuie simplement sur le lien ci-dessous et suis les instructions. Tu seras opérationnel en un rien de temps.\n
        ${link}\n
        Si tu n'as pas fait cette demande, ignore cet e-mail.\n

          `,
        html: `
        <p>Des difficultés à se connecter?</p>
        <p>Réinitialiser ton mot de passe est facile.</p>
        <p>Appuie simplement sur le lien ci-dessous et suis les instructions. Tu seras opérationnel en un rien de temps.</p>
        <p><a href="${link}">Réinitialiser mon mot de passe</a></p>
        <p>Si tu n'as pas fait cette demande, ignore cet e-mail.</p>
        `,
      });

      Logger.log(`MailService.forgotPassword send correctly`);
    } catch (error) {
      throw new InternalServerErrorException('Failed to function MailService.forgotPassword : ' + error.message);
    }
  }
}
