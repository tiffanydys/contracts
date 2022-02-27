import fetch from "node-fetch";
import { storeFlaggedEvents } from "../repository/eventStore";
import { flag, verify } from "../repository/farms";
import { Account } from "../repository/types";
import { verifyAccount } from "./web3/signatures";

type Response = {
  success: boolean;
  score: number;
};

async function request(token: string) {
  console.log({ token });

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=6Lfqm6MeAAAAAE9WRcv-mS0-xWUa2hmj2AcYb5YB&response=${token}`,
    {
      method: "POST",
    }
  );
  const data: Response = await response.json();
  console.log({ data });
  return data;
}

type VerifyOptions = {
  farm: Account;
  captcha?: string;
};
export async function verifyCaptcha({ farm, captcha }: VerifyOptions) {
  const timeToVerify = !farm.verifyAt || new Date() > new Date(farm.verifyAt);

  console.log({ timeToVerify, farm });
  if (timeToVerify) {
    if (!captcha) {
      return false;
    }

    const response = await request(captcha);
    console.log({ response });

    // Check the score of the captcha
    if (!response.success) {
      // Update the verifyAt in the database
      storeFlaggedEvents({
        account: farm.updatedBy,
        farmId: farm.id,
        events: [{ captcha: "failed" }],
        version: farm.version,
      });

      await flag({
        id: farm.id,
        flaggedCount: farm.flaggedCount + 1,
      });

      return false;
    }

    // Update verified at
    await verify({ id: farm.id });
  }

  return true;
}
