import { WorkerHost, Processor } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { MailService } from "./mail.service";
import { Job } from "bullmq";
import { error } from "console";

interface SendOtpJobData {
  email: string;
  otp: string;
}

@Processor('mail-queue', {
    concurrency: 10,
    limiter: {
        max: 50,
        duration: 1000,
    }
})

export class MailProcessor extends WorkerHost {
    private readonly logger = new Logger(MailProcessor.name);

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job<SendOtpJobData>): Promise<void> {
        const {email, otp} = job.data;
        this.logger.log(`[Worker] Dispatching email to ${email} (Job #${job.id})`);

        try {
            await this.mailService.sendOtpEmail(email, otp);
            this.logger.log(`[Worker] Successfully sent OTP to ${email}`);
        } catch (error) {
            this.logger.error(`[Worker] Failed to dispatch email to ${email} (Job #${job.id})`);
        }
        throw error;
    }

}