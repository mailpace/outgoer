<br>
<h2 align="center">
    <a href="https://outgoer.com" target="blank_"><img alt="Outgoer Logo" src="outgoer-logo.png" /></a>
    <br>
    <br>
    A modern SMTP proxy for sending outgoing emails.
</h2>
<br>


 Outgoer routes email **from your apps to 3rd party email providers**, helping to maximize delivery rates, centralize provider management, and simplify sending email.

> _Redefine the art of sending emails with Outgoer. Break free from the limitations of traditional methods and embrace a new era of streamlined communication, where every email becomes a catalyst for success._  
_\- <a href="chat.openai.com/">GPT 3.5</a>_

<br />

[![Build](https://github.com/mailpace/outgoer/actions/workflows/nodejs.yml/badge.svg)](https://github.com/mailpace/outgoer/actions/workflows/nodejs.yml)
[![codecov](https://codecov.io/gh/mailpace/outgoer/graph/badge.svg?token=YKRUO2GUPG)](https://codecov.io/gh/mailpace/outgoer)
[![License](https://img.shields.io/github/license/mailpace/outgoer)](https://github.com/mailpace/outgoer/blob/main/LICENSE)


## Drop Outgoer into your stack to 

- 📨 Manage multiple transactional email providers
- 🔌 Handle SMTP provider outages
- 📈 Scale and track sending email from multiple apps & containers
- ⚡ Speed up sending emails
- 🚀 Remove email client library dependencies from your apps
- 🛡️ Reduce outbound spam from your network
- 📥 Remove email client library dependencies from your apps
- ✏️ Modify emails coming out of your network

and more!

Outgoer is simple to setup, lives inside your network, and speaks the same SMTP your apps use today.

# How it works

1. Deploy Outgoer on your network
2. Add your 3rd party SMTP and API credentials to Outgoer
3. Point your Application emails at Outgoer's SMTP address
4. Outgoer does the rest!

# Requirements

- Redis: 6.2+

# Installation

- `docker pull mailpace/outgoer:v1`
- `docker run -p 8080:8080 --env CONFIG_VAR="abc" mailpace/outgoer:v1`

# Configuration

See [examples/configuration]() for example configurations.

# Metrics

There is a Prometheus endpoint for metrics available by default on at `/metrics' on port `8080`. See /dashboards for an example Grafana dashboard.

There is a Dashboard to view the current queue available at `/dash` on port `8080`.

# Who, what why

Outgoer was created, and is maintained by https://mailpace.com - a Transactional Email provider
