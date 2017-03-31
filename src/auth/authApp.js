import queryString from 'query-string'
import { decodeToken } from 'jsontokens'
import protocolCheck from 'custom-protocol-detection'
import { BLOCKSTACK_HANDLER, BLOCKSTACK_STORAGE_LABEL, DEFAULT_BLOCKSTACK_HOST } from './authConstants'
import { verifyAuthResponse } from './authMessages'

export function isUserSignedIn() {
  return window.localStorage.getItem(BLOCKSTACK_STORAGE_LABEL) !== null
}

export function redirectUserToSignIn(authRequest,
  blockstackIDHost = DEFAULT_BLOCKSTACK_HOST) {
  const protocolURI = `${BLOCKSTACK_HANDLER}:${authRequest}`
  const httpsURI = `${blockstackIDHost}?authRequest=${authRequest}`

  protocolCheck(protocolURI, () => {
    // console.log('protocol handler not detected')
    window.location = httpsURI
  }, () => {
    // console.log('protocol handler detected')
  })
}

export function getAuthResponseToken() {
  const queryDict = queryString.parse(window.location.search)
  return queryDict.authResponse ? queryDict.authResponse : null
}

export function isSignInPending() {
  return getAuthResponseToken() !== null
}

export function signUserIn(callbackFunction) {
  const authResponseToken = getAuthResponseToken()

  if (verifyAuthResponse(authResponseToken)) {
    const tokenPayload = decodeToken(authResponseToken).payload
    const userData = {
      username: tokenPayload.username,
      profile: tokenPayload.profile,
      authResponseToken: authResponseToken,
    }
    window.localStorage.setItem(
      BLOCKSTACK_STORAGE_LABEL, JSON.stringify(userData))
    callbackFunction(true)
  } else {
    callbackFunction(false)
  }
}

export function loadUserData(callbackFunction) {
  const userData = JSON.parse(window.localStorage.getItem(BLOCKSTACK_STORAGE_LABEL))
  callbackFunction(userData)
}

export function signUserOut(redirectURL) {
  window.localStorage.removeItem(BLOCKSTACK_STORAGE_LABEL)
  window.location = redirectURL
}