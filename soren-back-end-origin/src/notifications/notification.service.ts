import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationLog } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepository: Repository<NotificationLog>,
  ) {}

  async sendEmail(destination: string, subject: string, message: string): Promise<void> {
    this.logger.log(`[DEV MAILER] to=${destination} subject=${subject} message=${message}`);
    await this.notificationLogRepository.save(
      this.notificationLogRepository.create({
        channel: 'EMAIL',
        destination,
        message: `${subject}\n${message}`,
        status: 'MOCK_SENT',
      }),
    );
  }

  async sendSms(destination: string, message: string): Promise<void> {
    const smsEnabled = process.env.SMS_PROVIDER_ENABLED === 'true';
    if (smsEnabled) {
      this.logger.log(`[SMS PROVIDER ENABLED - MOCK] sending to ${destination}`);
    } else {
      this.logger.log(`[SMS MOCK] to=${destination} message=${message}`);
    }

    await this.notificationLogRepository.save(
      this.notificationLogRepository.create({
        channel: 'SMS',
        destination,
        message,
        status: smsEnabled ? 'PROVIDER_ENABLED_MOCK_SENT' : 'MOCK_SENT',
      }),
    );
  }
}
