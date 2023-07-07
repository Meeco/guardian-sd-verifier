import { ChangeEvent, useState } from "react";
import fetchResolveDid from "./fetchResolveDid";
import { createPresentation, issue, signPresentation } from '@digitalbazaar/vc';
import { generateKeyPair, getSuite } from "./generateKeyPair";
import documentLoader from "./documentLoader";
import moment from "moment";


function App() {
  const [verificationMethods, setVerificationMethods] = useState([])
  const [credential, setCredential] = useState<any>()
  const [verifiableCredentialDid, setVerifiableCredentialDid] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<any>()

  const getVerificationMethods = async () => {
    const { didDocument } = await fetchResolveDid(verifiableCredentialDid)
    const { verificationMethod } = didDocument
    setVerificationMethods(verificationMethod)
  }

  const handleExtractDid = () => {
    if (credential) {
      const { credentialSubject } = credential
      setVerifiableCredentialDid(credentialSubject.id)
      handleGenKeyPair(credentialSubject.id).then(async (keyPair) => {
        const date = moment(credential.credentialSubject.valid_until).add(1, 'y').format('YYYY-MM-DD')

        const formattedCredential = {
          ...credential,
          "@context": ["https://www.w3.org/2018/credentials/v1", "https://ipfs.io/ipfs/QmdafSLzFLrTSp3fPG8CpcjH5MehtDFY4nxjr5CVq3z1rz"],
          issuer: {
            ...credential.issuer,
            id: credential.credentialSubject.id,
            name: "Self Asserted"
          },
          credentialSubject: {
            ...credential.credentialSubject,
            type: "auditor_template",
            valid_until: date
          }
        }
        delete formattedCredential.credentialStatus

        const suite = getSuite(keyPair)
        const signedVC = await issue({ credential: formattedCredential, suite, documentLoader });
        console.log(JSON.stringify(signedVC, null, 2));

        const presentation = createPresentation({
          verifiableCredential: signedVC
        });

        console.log("presentation: ", JSON.stringify(presentation, null, 2));
        console.log("\n")

        const vp = await signPresentation({
          presentation, suite, challenge: 'challenge', documentLoader
        });

        console.log("Singed Presentation: ", JSON.stringify(vp, null, 2));
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = e => {
        const str: string = e.target?.result as string || ''
        if (str) {
          setCredential(JSON.parse(str))
        }
      };
    }
  };

  const getDisplayedMethod = (input: string) => {
    const index = input.indexOf("#");
    if (index !== -1) {
      return input.slice(index + 1);
    }
    return null;
  }


  const handleGenKeyPair = async (id: string) => {
    const keyPair = await generateKeyPair(id)

    return keyPair
  }

  return (
    <div className="App">
      <div className="file">
        <p>VC</p>
        <input type="file" name="vc-file" id="vc-file" onChange={handleFileChange} />
      </div>
      <button onClick={handleExtractDid}>Extract DID</button>
      {verifiableCredentialDid ? (
        <> <div className="did">
          <p>DID: </p>
          <p>{verifiableCredentialDid}</p>
        </div>
          <div>
            <button onClick={getVerificationMethods}>Get verification Method(s)</button>
            {verificationMethods && <div>
              <div>
                {
                  verificationMethods.map((item: any) => (
                    <div>
                      <input type="radio" value={item.id} name="verification-method" onChange={() => {
                        setSelectedMethod(item)
                      }} />
                      <label htmlFor="label">#{getDisplayedMethod(item.id)}</label>
                    </div>
                  ))
                }
              </div>
            </div>}
          </div>
        </>

      ) : null}
    </div>
  )
}

export default App;
