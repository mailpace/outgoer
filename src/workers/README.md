TODO: move this to dedicated docs site

# Sender.ts

Handles sending emails.

## Flow

```mermaid
graph TD;
    processEmailJob["processEmailJob"] --> selectService["selectService (based on priority and  attempts to send)"];
    selectService --> updateJobProviders["updateJobProviders (update the job with attempted provider and increment attempts)"];
    updateJobProviders --> incrementSenderSent["incrementSenderSent (increment sent for this sender globally)"];
    incrementSenderSent --> createTransport;
    createTransport --> sendEmail;
```

If any unhandled errors occur, the email send will retry via the MQ retry mechanism.

# ResetCount.ts

Resets the count of a service every month, based on the Application Config