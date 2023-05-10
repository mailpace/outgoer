import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { SMTPServer } from 'smtp-server';
import nodemailer from 'nodemailer';

describe('SMTP Server Integration Test', () => {
  let smtpServer: SMTPServer;
  let child: ChildProcessWithoutNullStreams;
  const outgoerPort = 2525;
  const port = 2526;

  beforeAll(async () => {
    // Build and start Outgoer, as a child process
    child = spawn('npm', ['run', 'build:start'], {
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    await new Promise<void>((resolve) => {
      child.stdout.on('data', (data: any) => {
        if (data.toString().includes(`listening on 127.0.0.1`)) {
          resolve();
        }
      });
    });

    // Create an instance of the SMTP server (the forwarding target)
    smtpServer = new SMTPServer({
      authOptional: true,
      onData(stream, _session, callback) {
        const chunks: any[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
          const message = Buffer.concat(chunks).toString();
          console.log(message);
          callback();
        });
      },
    });

    // Start the SMTP server
    smtpServer.listen(port);
  });

  afterAll(async () => {
    // Stop the SMTP server Outgoer
    smtpServer.close();

    // THIS ISN"T WORKING, SO THE PROCESS STAYS UP FOREVER, WHICH MEANS SUBSEQUENT TEST RUNS FAIL
    child.kill();
  });

  it('forwards an email to another SMTP server', async () => {
    // Create a test email
    const transporter = nodemailer.createTransport({
      port: outgoerPort,
      ignoreTLS: true, // necessary for testing with self-signed certificates
    });
    const info = await transporter.sendMail({
      from: 'test@example.com',
      to: 'forward@example.com',
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    expect(info.accepted).toContain('forward@example.com');
  });
});
