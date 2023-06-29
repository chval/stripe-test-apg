# Ascio Payment Gateway test application
Test web application to check Ascio Payment Gateway methods.

## Install NodeJS and modules
It\'s better to use [nvm](https://github.com/nvm-sh/nvm) to install latest `lts` version of NodeJS:
```
nvm install --lts
```

Then install packages:
```
npm install
```

## Configure environment variables
Create <ins>.env</ins> file with next variables:
```
SERVER_PORT=443
APG_ENDPOINT=https://paymentgateway.demo.ascio.loc/api/
TOKEN_ENDPOINT=https://auth.demo.ascio.loc/connect/token
# client id and secret from https://auth.demo.ascio.loc/
CLIENT_ID=
CLIENT_SECRET=
STRIPE_PUB_KEY=
STRIPE_SEC_KEY=
```

### Prepare TLS certificate
As we are going to communicate with Ascio Payment Gateway under ***https*** protocol, we need a TLS certificate and a private key for it.
Generate ***4096*** bits private key (without passphrase) and self-signed certificate:
```
cd tls/
openssl req -x509 -newkey rsa -keyout key.pem -out cert.pem -days 365 -config openssl.cnf
```
As a result we have 2 files: *key.pem* and *cert.pem*<br>
To print a certificate info:
```
openssl x509 -in cert.pem -noout -text
```

## Start server
```
npm start
```

Now visit https://localhost page in a browser
