# Guardian Selective Disclosure Verifier

Guardian Selective Disclosure - Presentation Exchange Verifier DApp

This is a web app that interacts with the responders.

You can get and run a responder here. https://github.com/Meeco/guardian-sd-responder

## Getting Started

See guide at https://github.com/Meeco/guardian-sd-responder/blob/main/docs/GETTING_STARTED.md

## Running

It can be run locally with node >= 16:

Ensure `.env.example` is copied as `.env` and completed with all properties.

| Property                               | Description                                                   |
| -------------------------------------- | ------------------------------------------------------------- |
| `REACT_APP_TESTNET_DEFAULT_TOPIC_ID`   | Default topic for sending/receiving message from HCS(testnet) |
| `REACT_APP_MAINNET_DEFAULT_TOPIC_ID`   | Default topic for sending/receiving message from HCS(mainnet) |
| `REACT_APP_DID_UNIVERSAL_RESOLVER_URL` | Url of universal did resolver.                                |

NB. The DID universal resolver defaults to [https://dev.uniresolver.io](https://dev.uniresolver.io). If using `did:hedera`, you may need to run local resolver for testing, for example [hedera-did-universal-resolver-mock](https://github.com/Meeco/hedera-did-universal-resolver-mock).

- Install dependencies with `yarn` (`npm i -g yarn` to install yarn if you do not have it installed)
- `yarn start` to start the responder listening on the configured topics

## Developing

Dependencies:

- [Hashpack wallet](https://www.hashpack.app/); [web-app](https://wallet.hashpack.app/), [chrome extension](https://chrome.google.com/webstore/detail/hashpack/gjagmgiddbbciopjhllkdnddhcglnemk) or [mobile application](https://www.hashpack.app/download).

Folder structure for `src`:

- `components` - React components
- `consensusService` - Functions relevant to Hedera consensus service e.g., submit message to topic, get topic's messages
- `didService` - Functions relevant to DID e.g., resolve did
- `fileService` - Functions relevant to Hedera file service e.g., create file, get file's contents
- `hashConnectService` - Functions relevant to HashConnect library e.g., init connection, connect to wallet
- `mock` - Mock files for testing
- `types` - e.g., message types
- `utils` - Utility functions e.g., decrypt data, documentLoader, poll request, derive key
