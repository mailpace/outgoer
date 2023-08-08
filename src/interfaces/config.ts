import { SMTPServerOptions } from "smtp-server";

/**
 * Configuration object for Outgoer settings
 */
export interface EmailConfiguration {
  session: any;
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

    onAuth?: SMTPServerOptions["onAuth"];
  };

  customAuthPath?: string;

  dashboard: {
    metricsPath: string /** Endpoint for grafana metrics */;
    dashboardPath: string /** Endpoint for arena dashboard */;
    port: number /** Port number for metrics and arena dashboard */;
    host: string /** Host for metrics and arena dashboard */
  }

  /**
   * Array of 3rd party services to send emails through
   * At least one service must be provided
   * Each object includes the host, port, secure, and auth fields.
   */
  services: {
    name: string, /** Arbitrary name of service */
    provider: string /** Must be one of the available supported services */
    priority: number /** Priority of the delivery mechanism */;
    limit?: number /** Maximum number of emails/month */;
    limitResetDay?: number /** Day of the month the maximum emails is reset, defaults to 1 */
    username?: string /** Username from service provider */
    api_key?: string /** API token from service provider */

    smtpSettings?: {
      host: string /** Hostname or IP address of SMTP server */;
      port: number /** Port number for SMTP server */;
      secure: boolean /** Whether the SMTP server uses SSL/TLS encryption */;
      auth?: {
        user: string /** Username for SMTP server authentication */;
        pass: string /** Password for SMTP server authentication */;
      };
    };
  }[];

  redis: {
    host: string,
    port: number
  };

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
