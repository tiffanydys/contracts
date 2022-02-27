import fetch from "node-fetch";
import { Account } from "../repository/types";

async function request(token: string) {
  // TODO - secret keys
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=6LdNNqIeAAAAAEqkLwmHizFJUXtFZakDLpVUqXhd&response=${token}`;

  const response = await fetch(url);
  const data = await response.json();
  console.log({ data });
}

type VerifyOptions = {
  farm: Account;
  captcha?: string;
};
export async function verifyCaptcha({ farm, captcha }: VerifyOptions) {
  const timeToVerify = new Date() > new Date(farm.verifyAt);
  if (timeToVerify) {
    if (!captcha) {
      return false;
    }

    const response = await request(captcha);
    console.log({ response });

    // Check the score of the captcha

    // Update the verifyAt in the database
  }

  return true;
}
