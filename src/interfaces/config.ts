/**
 * Configuration object for Outgoer settings
 */
export interface EmailConfiguration {
  /**
   * The Outgoer SMTP server options
   */
  outgoerSmtpServer: {
    name: string /** Server name of the Outgoer SMTP server */;
    serverHost: string /** Server host of the Outgoer SMTP server */;
    port: number /** Port number the Outgoer SMTP server will listen on */;
    size: number /** Maximum size of emails, in bytes */;

    key?: Buffer | string /** Private key for SSL/TLS encryption */;
    cert?: Buffer | string /** Public key for SSL/TLS encryption */;
    ca?:
      | Buffer
      | string
      | Buffer[]
      | string[] /** Certificate authority chain for SSL/TLS encryption */;
  };

  metrics: {
    path: string /** Endpoint for grafana metrics */;
    port: number /** Port number for grafana metrics */;
  };

  /**
   * Array of 3rd party services to send emails through
   * At least one service must be provided
   * Each object includes the host, port, secure, and auth fields.
   */
  services: {
    type: /** Whether this is vanilla SMTP server or 3rd party library */
      | 'smtp'
      | 'library';
    priority: number /** Priority of the delivery mechanism */;
    limit: number /** Maximum number of emails/month */;

    smtpSettings?: {
      host: string /** Hostname or IP address of SMTP server */;
      port: number /** Port number for SMTP server */;
      secure: boolean /** Whether the SMTP server uses SSL/TLS encryption */;
      auth: {
        user: string /** Username for SMTP server authentication */;
        pass: string /** Password for SMTP server authentication */;
      };
    };

    // TODO: think the 3rd party providers through
    providerName: string,
  }[];

  /**
   * Functions that modify the email envelope / contents
   */
  modifiers?: {
    // TODO: define this
    name: string;
  }[];

  /**
   * Functions that define rules for routing
   */
  routes?: {
    // TODO: define this
    name: string;
  }[];
}
