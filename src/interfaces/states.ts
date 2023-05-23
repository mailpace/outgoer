/**
 * All the possible states an email can be in
 */
export const emailStates = {
    QUEUED: 'queued', // has arrived and been added to email queue
    PROCESSING: 'processing', // under modification, routing, or prioritisation
    SENT: 'sent', // successfully sent to provider
    RETRYING: 'retrying', // Error, retrying with current or next available provider
    RETRYING_NEXT_PROVIDER: 'retrying_next_provider', // TODO: implement tracking this state: Fatal provider error, moving to next provider
    FAILED: 'failed', // No providers left to try, all attempts have failed
  };
  