import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import treeKill from 'tree-kill';
import { SMTPServer } from 'smtp-server';
import nodemailer from 'nodemailer';

describe('Outgoer Integration Test', () => {
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

    // Wait for it to work
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
      onData: jest.fn((_stream, _session, callback) => {
        callback();
      })
    });

    // Start the SMTP server
    smtpServer.listen(port);
  });

  afterAll(async () => {
    // Stop the SMTP server and Outgoer
    smtpServer.close();
    if (child && child.pid) {
      treeKill(child.pid);
    }
  });

  it('forwards an email to another server', async () => {
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

    // TODO: Assert added to redis/bullmq - is this even possible from here?
    // TODO once SMTP provider working: expect(smtpServer.onData).toHaveBeenCalled();
  });
});
