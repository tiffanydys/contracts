import fetch from "node-fetch";
import { storeFlaggedEvents } from "../repository/eventStore";
import { flag, verify } from "../repository/farms";
import { Account } from "../repository/types";

type Response = {
  success: boolean;
  score: number;
};

async function request(token: string) {
  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY}&response=${token}`,
      {
        method: "POST",
      }
    );
    const data: Response = await response.json();
    return data;
  } catch (e) {
    console.error(`Captcha verification failed: ${e}`);
    // If the API call fails, give user benefit of the doubt and mark as verified
    return { success: true, score: 1 };
  }
}

type VerifyOptions = {
  farm: Account;
  captcha?: string;
};
export async function verifyCaptcha({ farm, captcha }: VerifyOptions) {
  const timeToVerify = !farm.verifyAt || new Date() > new Date(farm.verifyAt);

  if (timeToVerify) {
    if (!captcha) {
      return false;
    }

    const response = await request(captcha);

    // Check the score of the captcha
    if (!response.success) {
      // Update the verifyAt in the database
      await storeFlaggedEvents({
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
