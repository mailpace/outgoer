<cute logo here>

Outgoer is a modern SMTP proxy for sending outgoing emails. It routes email from your apps to 3rd party email providers, helping to maximize delivery rates, centralize provider management, and simplify sending email.

> _Redefine the art of sending emails with Outgoer. Break free from the limitations of traditional methods and embrace a new era of streamlined communication, where every email becomes a catalyst for success._  
_\- <a href="chat.openai.com/">GPT 3.5</a>_

![Build](https://github.com/mailpace/outgoer/actions/workflows/nodejs.yml/badge.svg)

## Drop Outgoer into your stack to 

- Scale and track sending email from multiple apps & containers
- Speed up sending emails
- Manage multiple transactional email providers
- Reduce outbound spam from your network
- Remove email client library dependencies from your app
- Modify all emails coming out of your network

and more!

Outgoer is simple to setup, lives entirely inside your network, and speaks the same SMTP your apps  use today.

# How it works

- Deploy Outgoer on your own network
- Add your sender credentials to Outgoer
- Point your apps email SMTP at Outgoer
- Outgoer does the rest!

# Requirements

- Redis: 6.2+

# Installation

- `docker pull mailpace/outgoer:v1`
- `docker run -p 8080:8080 --env CONFIG_VAR="abc" mailpace/outgoer:v1`


# Configuration

See examples/configuration for example configurations.


# 

Outgoer was created, and is maintained by https://mailpace.com - a Transactional Email provider