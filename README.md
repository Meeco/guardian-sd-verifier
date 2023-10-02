# Guardian Selective Disclosure Verifier

Guardian Selective Disclosure - Presentation Exchange Verifier DApp

This is a web app that interacts with the responders.

You can get and run a repsondor here. https://github.com/Meeco/guardian-sd-responder

## Gettign Started

See guide at https://github.com/Meeco/guardian-sd-responder/blob/main/docs/GETTING_STARTED.md

## Running

It can be run locally with node >= 16:

Ensure `.env.example` is copied as `.env` and completed with all properties.

| Property                     | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `REACT_APP_TOPIC_ID`         | Default topic for sending/recieving message from HCS |
| `REACT_APP_MIRROR_NODE_URL`  | Hedera's mirror node REST API Url                    |
| `REACT_APP_DID_RESOLVER_URL` | Url of did resolver on verifier side                 |

- Install dependencies with `yarn` (`npm i -g yarn` to install yarn if you do not have it installed)
- `yarn start` to start the responder listening on the configured topics

## Developing

Dependencies:

- Blade wallet application on mobile phone

Folder strucutre:

- `bladeWeb3Service` - Functions relevant to blade-web3.js library
- `components` - React components
- `consensusService` - Functions relevant to Hedera consensus service e.g., make topic, submit message to topic, get topic's messages
- `didService` - Functions relevant to DID e.g., resolve did
- `fileService` - Functions relevant to Hedera file sevice e.g., create file, get file's contents
- `hederaService` - Functions relevant to Hedera e.g., create Hedera client instance
- `mock` - Mock files for testing
- `types` - e.g., message types
- `utils` - Utility functions e.g., decrypt data, documentLoader, poll request, derive key
