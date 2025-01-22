"server only";

import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
	pinataJwt: `${process.env.PINATA_JWT}`,
	pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

// To get the client side form implementation of file uploads to pinata:
// Visit the url: https://docs.pinata.cloud/frameworks/next-js-ipfs#create-client-side-form

// If file size limitation is crossed consistently and there is need to upload more than the limit
// then this implementation can be changed to follow the guide:
// https://www.pinata.cloud/blog/how-to-upload-to-ipfs-from-the-frontend-with-signed-jwts/
