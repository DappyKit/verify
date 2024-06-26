import React, { useMemo, useState } from 'react'
import { CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { HDNodeWallet, Wallet } from 'ethers'

function GoogleVerify() {
  const verifyUrl = process.env.REACT_APP_VERIFY_GOOGLE_URL as string
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID as string

  if (!(verifyUrl && clientId)) {
    throw new Error('REACT_APP_VERIFY_GOOGLE_URL and REACT_APP_GOOGLE_CLIENT_ID env variables are required')
  }

  const [credentialResponse, setCredentialResponse] =
      useState<CredentialResponse | null>()
  const [status, setStatus] = useState<string>('wait')
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('')
  const [wallet] = useState<HDNodeWallet>(Wallet.createRandom())

  const user = useMemo(() => {
    if (!credentialResponse?.credential) return
    return jwtDecode(credentialResponse.credential)
  }, [credentialResponse])

  return (
      <div className="container mt-5">
        <h3>Verify via Google</h3>

        <div className="mt-5">
          <GoogleOAuthProvider clientId={clientId}>

            <GoogleLogin
                onSuccess={async credentialResponse => {
                  setCredentialResponse(credentialResponse)
                }}
                onError={() => {
                  console.log('Login Failed')
                }}
            />
          </GoogleOAuthProvider>

          <button className="btn btn-primary mt-5" disabled={!Boolean(user)} onClick={async ()=>{
            if (!credentialResponse?.credential) {
              throw new Error('Credential is not defined')
            }

            const eoaSignature = await wallet.signMessage(credentialResponse!.credential)

            try {
              const response = await (await fetch(verifyUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  data: credentialResponse!.credential,
                  eoaSignature
                })
              })).json()

              console.log('response', response)
              if (response.status === 'ok') {
                setStatus('ok')
                if (response.data.recoveredAddress !== wallet.address) {
                  alert(`Recovered address ${response.data.recoveredAddress} is not equal to the wallet address ${wallet.address}`)
                  return
                }

                setSmartAccountAddress(response.data.verifiedSmartAccountAddress)
              } else {
                setStatus('failed')
              }
            } catch (e) {
              setStatus('failed ' + (e as Error).message)
            }
          }}>Send data to the server</button>
        </div>

        <h2 className="mt-5">Status: {status}</h2>

        <div className="mt-5">
          <p>EOA Wallet Address: {wallet?.address}</p>
          {smartAccountAddress && <p><strong>Smart Account Address: {smartAccountAddress}</strong></p>}
          <p>Test App ID: {clientId}</p>
          <p>Verify URL: {verifyUrl}</p>

          {user && <details className="mt-2">
            <summary>Google Response</summary>
            <code>
              {user ? JSON.stringify(user, null, 2) : undefined}
            </code>
          </details>}
        </div>

      </div>
  )
}

export default GoogleVerify
