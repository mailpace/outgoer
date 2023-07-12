TODO: move this to dedicated docs site

# Sender.ts

Handles sending emails.

## Flow:

processEmailJob -> selectService (based on priority from application config and previous attempts to send this email) -> updateJobProviders (update the mq job with attempted provider and increment attempts for this email) -> incrementSenderSent (increase the amount sent for this sender globally) -> createTransport / sendEmail (create the sending service and send the email)

If any unhandled errors occur, the email send will retry via the MQ retry mechanism.
