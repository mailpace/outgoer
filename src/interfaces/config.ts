/**
 * Configuration object for Outgoer settings
 */
export interface EmailConfiguration {
  port: number /** Port number the Outgoer server will listen on */;

  /**
   * Array of SMTP server objects to send through
   * Each object includes the host, port, secure, and auth fields.
   * Either `smtpServers` or `emailProviders` must be provided.
   */
  smtpServers?: {
    host: string /** Hostname or IP address of SMTP server */;
    port: number /** Port number for SMTP server */;
    secure: boolean /** Whether the SMTP server uses SSL/TLS encryption */;
    auth: {
      user: string /** Username for SMTP server authentication */;
      pass: string /** Password for SMTP server authentication */;
    };
    priority?: number /** Priority of the delivery mechanism */;
  }[];

  /**
   * Array of email provider objects to send through
   * Each object includes the name, smtpServerIndex, and fromEmail fields.
   * Either `smtpServers` or `emailProviders` must be provided.
   */
  emailProviders?: {
    // TODO: define this
    name: string /** Name of the email provider */;
    priority?: number /** Priority of the delivery mechanism */;
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

  /**
   * Optional secure settings for hosting Outgoer
   */
  secureSettings?: {
    key: Buffer | string /** Private key for SSL/TLS encryption */;
    cert: Buffer | string /** Public key for SSL/TLS encryption */;
    ca?:
      | Buffer
      | string
      | Buffer[]
      | string[] /** Certificate authority chain for SSL/TLS encryption */;
  };

  /**
   * Endpoint for grafana metrics
   */
  metricsEndpoint: String;
}
