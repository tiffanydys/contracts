import jwt from "jsonwebtoken";
import { UserAccess } from "../domain/auth/userAccess";

/**
 * Only used in local host testing, .env file has issues storing this
 */
const dummyPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,4CA59A904E35A7BBD5E22FEA47150C03

/liAAvLHoLJqFKCuUJMnaBpjRhofJLvwSOa7UA34Bu09qf7oGe5xrLztB0A4MuAx
T7EsD/KbtXZwPK1+1xmXPbHO0bNsuTaKdkfmKoPiDI2SNsR8uXMXBaap/391sL/G
akrQ9vEs7RiR6KlEmvahBn2ottOdLKfUyPYaQ58jtklfTZS0uFv9/AXvDo7OCJcH
SNSQH7PcyP2Kn9a9/5eXnwA8HcsSy399UCHSglVjVXbcoG5Gdlxfl6MPJrF0Z4vw
UzxNl2xP/EhyChJwojSdlRAfIZ8UX58EFBrVImTLqQX45vE5BzmwKrGSBNv0q3L8
h1XCHlC/TQpLpvc9poqGCGfFRImJbiv1GJWeprc7Ef98d/LLVmCi4Jc5WczX+Cn1
9ACI4a6qONg0TWL+QoCGtuOnX5jlnCVOMfwzy9HtPqhB7qhOHV3OYRfTqSRo5ysD
74KcAFQaedAwVq9aERDfKmzvkNWqWE49NqDGasHiRDj1/IZ9PYfa9+o0rRWz3Ipv
jK88Kr/vchkApc5LTRvZwxo6YdNN155Z55k8JCWtm5SM7qSIy8Dr4ClW/PQZ+KqB
pmkDu4+79Lmzr5m8pwm5jDaAK8LWIGS1a9MEWAUHDHhuk5BtePHQBmlH4UgRjuTh
3lpUCTXsyU0w9AxtPRFJuJWWigXk5iQKueAqUeV5ttH2yhIqGosbUgx6O4esuGIW
spIi+Dx2q3oCK22t2WK8oeHHVEpO/EkF/Z6ZLup67w+WMYoGin8kmQqbksh/manR
MMGbSKugdncWq+5D0eJlyhCmIStERKf+E3VicxgnvcC23jKpbXwuOolcW8jcHgiV
+4tlmbT5iRVNJSn8QtEaUjPlkJrRgKsv78eCqGtPQJsv+JYbVWSGR8UFhmqoXnt9
QYWSmbFyW4f/Cqd/rG6zonE+tAXJVHHx5mghK5ancdppURq27PhBeQtnnbvPZAT9
t/vjPHfzHV86PoTdkM/vBEE6TQ3c/l7cGNhZVY0qQTCTWQ5Tbism17rpahS0Vmzk
P3spV8HDsm/3K6+9G+WWNkQrsSDWUBswSGExgwBsb6KExlitjvagrlGNynRfFNPe
4GdNnbIIaFFr2uIiSvMMkRdwx50UNT8k7k98TNkHoJM15aX24iTquI6BKmCvMeSa
Yoin5/TP8LjWONqf+Krytx2bwYr4ZiFTu0OPYirzHSS7C8A1kJ/Ntt4cMLYCibWm
s46/+u+9ryTKYNgOjq9gOuDIA3w6fKc14juHfl3LqD3vmxPlQP0nMP9EopWNS0iB
DPCgNQaNHBxEnI1CCbHgMhAluXG8q0+5MOBeqlzW5l4EGqSR6HgW+xkQXHiEEUIy
upgqMoHN5JV0ruj0N63GENwi2tDg8hp5b7GorVh8PpOvTdE2rHRw92YHO3M01CsM
Sx9uAgwSN7ZpGCQY6lrjLBzbCFjzgXRN6XJ4O6kpPh21w+7lNYMeB4pT8VOpzoAj
Nyrfo/ojz7xKID6h24LORTxg28DID/WeoRfFF4/qUBK79+9lMI9GKxmYq9O9qdLk
i9zShK/6pU1GTAmInKwRE7Ux1uZt5Rebamd+L9NlRjf7E0qF+Btgu6tx4yF8F73Z
lcFMCwYvGkDkUJsMXFnemaZnjTCG2aYOfV4biLUPS9wGwoBdmy+D9+QXaAQsWd2R
5TR+rPQRvvOPv4nB0kkmIljQHIcbxB8Tt/v/dd9a7V2wMkM2S0tcCCxraqJ/teib
/DeziTWCO8GE33F0PElhNJ+CgGkzDtxh+Jl1oV/gJihGzlqbXpmLoJC45y+OZ70Q
FaDUnFVtXDBDWBIM1xTEG711OYe5TgzOFDaRgHeH98LtJ/zjKJYEt85kRqQGNoiV
qXSsu+MYMTN4PmIs9VbgWMEeqZJDpq0tdQhlqQbq1zRRwd656ocJ/AZ9KPigLJie
lfMVr5zEk2PxIf1lCXnl8joZJyfudWSgb+iNMCNLVx1HT36rTPKXEkpAxxbecTcw
nA99nHftfIILz7OvNeudPam2qY8lFrRXDFXPSZDdVTE9j4JghQyWAqgjMldHQZYF
+Jbl4x+OMu9mWIlIeUTH3bMZj1Z8q7MKxAZuJhmMZ50Zr4SSM9BddtB9NKqEnlna
TZUtqqK/zA4TbHgdPKp4YD9vcHNmw637il+y8yPA5ej1gdaCYUD0Wc9v14OHhWhx
jJGx+DFJe+Z4/TeuOoemT070ozG9N388R1ru9mqg1nmtlKMljXZIsRep3scA0A8/
Nb704suHuenyov0HPkyi1hGYlKlkZ0VrtUtl6gatAw1IIFM0Z7sGTtr7Yx24If0L
OCFJ9Z7ewsFidh/IDfzCrsIBJVb3fsfP2x1yLPdUPCGbKDKfd/qWQLS03gtYw0+6
OwaBqtG8CpiscnPV1HaMUvGkE1/nQH3QzBc2ZLdb017Gu+geIhJ1zjqF/FAvUttF
aV2iPHggjlW1xP+PuMpK+DlGaS7WgKwfqwNF3lmPFdMOQCYtxrqszsy9cGTtLapi
CYE1Vjbsa+d5s3AZA3FQkt/UN4Emq+zIuARdmBdSuPiu/oXGdECfKXdZuUQfIlbY
4b4gGhxE6AlVlNS7oaKV1QuUv6dXzlUOkuF1AS4LFKYJ+xRHrNQQVhCwWPzw/ahf
wQml8c3H9jiq6jJ3KwDRShiPmre1n8UrKZ7d3l4IZAc7fmSu47Y73IlZpkjFHfDF
ePCvp6AlzLnWaHDilWtn0h+QH57d/2FWBReOY8LSO0ri3vn9mfg2krbO94b87c0H
zqajd5lMTF5CZCUKdyBg2yhX9g9tfDL93afEMGhHJAY+vlRMZmrvqTiWxJUD1fgj
QEMmNkPgdKsO/59LSuOvSmQPgrZ71cecHbgv8eD8+1G/6DUDBs2bBuK+N7Plozh4
ngUoUlwyCQD6ozbRDXfP3FXRX51ysHQorh7aL7V8BlgJK3900C3rjxZQoXRZJMow
BBTcxP3Ixbcq55DSU2jgW9gQBdXysfIHLmr3enBExYxVlBw94xkIfltdwJ3vE364
glZO+B1NR/SPoK8FH32Ssdz64hox2SDXbl581o4DxPdFDwWeJZwTpGjhn5afc1l9
AkqGYNhD5pQs2t+kllUhVy2ifkhkSYxnUjygtmSr1kZ3IjeqrQ7bk0zgAO4hnrFv
-----END RSA PRIVATE KEY-----`;

const KEY = process.env.JWT_SECRET || dummyPrivateKey;

type Token = {
  address: string;
  userAccess: UserAccess;
  discordId?: string;
};

export function generateJwt(payload: Token) {
  const token = jwt.sign(
    payload,
    KEY,
    // Seconds - 1 day
    { expiresIn: 60 * 60 * 24 }
  );

  return { token };
}

/**
 * Verify and decode the JWT
 * Ensures it is not expired or malformed
 * Matches private key used to sign the token
 */
export async function verifyJwt(rawToken: string) {
  // Remove the 'Bearer '
  const token = rawToken.slice(7);

  const decoded = await jwt.verify(token, KEY);

  return decoded as Token;
}
