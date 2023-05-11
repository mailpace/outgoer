/**
 * Configuration object for Outgoer settings
 */
export interface EmailConfiguration {
  /**
   * The Outgoer SMTP server options 
   */
  outgoerSmtpServer: {
    name: string /** Server name of the Outgoer SMTP server */,
    serverHost: string /** Server host of the Outgoer SMTP server */,
    port: number /** Port number the Outgoer SMTP server will listen on */;
    size: number /** Maximum size of emails, in bytes */;

    key?: Buffer | string /** Private key for SSL/TLS encryption */;
    cert?: Buffer | string /** Public key for SSL/TLS encryption */;
    ca?:
      | Buffer
      | string
      | Buffer[]
      | string[] /** Certificate authority chain for SSL/TLS encryption */;
  }

  metrics: {
    path: string /** Endpoint for grafana metrics */;
    port: number /** Port number for grafana metrics */;
  }

  /**
   * Array of 3rd party SMTP servers to send emails through
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
   * Array of 3rd party email provider objects to send through
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


}
