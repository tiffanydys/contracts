const SYNC_WHITELIST = [
  "0x481a58b9385868267Ff39ab285D22234B50871eD",
  "0xc23Ea4b3fFA70DF89874ff65759031d78e40251d",
  "0x1ecb0a64f8AADdDF5AC176E890A8D418694ec666",
  "0x43B1633AE106Ab279db9CE79bc2b051F85Ab0738",
  "0xD755984F4A5D885919451eD25e1a854daa5086C9",
  "0xcC9bb698585E78355211710cc1c48fa15868a5d4",
  "0xA9Fe8878e901eF014a789feC3257F72A51d4103F",
];

// Lots of duplicates but does not really matter
const CREATE_FARM_WHITELIST = [
  ...SYNC_WHITELIST,

  // Artists
  // "0x002287ec2A4232467A06a92457306157a94ad9DC",
  // "0x2b3F0A1810A19250B76290Ed9b51cb9A518B3D95",
  // "0xb8Bf9f119a18513b0ABBe302986789bC385574C3",
  // "0x05863D02B228a048d467Ac7Ba8D8D42a1802DF2b",
  // "0xAA947a259E48F986F3a4d8A511BdC730410c0607",
  // "0x60959cdA4252b2E41055c81C648B5Af4eF53aD17",
  // "0xD6678938ecBB4d0AEFa61E625Ef84620ECbeE1EB",
  // "0x0E893541f9CFdf8Db2326720F0EbCAac411Ffd1E",
  // "0x8Bcc3389261679718DB663B94e255485F81d2Ab4",

  //Developers
  // "0xeD8906723B822368DB39401e4c40a3ff828c2906",
  // "0x60826e7d0ECA970845391F1e8db8B16B46C6CfdC",
  // "0x8d680eB6b3aD31ab065B1632bB44fa1456A26548",
  // "0x05f0E2750E1Ac47934D8e668926BFE7ADAF18319",
  // "0xad1270191afc38eB44947e37107cBca6765cabFe",
  // "0xA9355c8D53D80Baa736de0F48c1D1D8b21eb0234",
  // "0xbacae1ba4b2e591e98b158aa1bef27d16099ae0f",
  // "0x068BAb172FA62635DFB3cAbCF330EdbF63522cE4",
  // "0xD637918139D44a2DeC4Bbd24F77D8Fca355Cf53E"
  // "0x358A9bb416fe97231bAD833eb18215766F5788c2"

  //Beta test
  // "0x9528CE2C1F0e4E8Eeb3CBc31fb67601C3a87c2db",
  // "0x307CED27048cCe9928C69eB7296F5BeD270b1954",
  // "0x7E8931003Be6F9BE079070A2e8738D678710F238",
  // "0xfB33c8f8426Db534C0BA6494D4B9e824B390d658",
  // "0x6b01e5C6d32d4Aa79E1B0388155EcfE7697337D7",
  // "0x5e4cb298C7ED72796D4e5e76aE7B33f3C158E809",
  // "0xD26Cd4285c5e2A61f62E91E61C4309E737955ea7",
  // "0x7666f37D4B861eccc7794eC4d86f5a86686135E9",
  // "0x7Ea3BA63370C5b90c753AEFaeE612A06547688c2",
  // "0x9701FD645b3738dd0C0Fa458bC05Bc333E60426a",
  // "0x98F6723C38eD4d49a4A374a65B98Cd9D2d47F9c2",
  // "0x90CEB8A369B7aEA5C536290fc0745081D23791f2",
  // "0xd15EFe11A5C005ccFD5b377067B54c71D421cc2B",
  // "0xb680D032EbAEBa99261b52DC26b53794578E3201",
  // "0xCee8447dd036cdF5b5aeDa4FC8F880fdE479B13D",
  // "0x4381fa0c0E162Ce7c4330b47585d921b2200a949",
  // "0x89fF8e27b92c3Cf36bEf6580d11e1921Ea6Fa93E",
  // "0x87C58AEd46c67e787761b96D55E03dCEa7e4325A",
  // "0x72d5161f427D3d08f33a65A682CdFFC2E7B59Aaa",
  // "0xfaE50Dd6eE3CA1c7491786Ad5aB30D3Ee3982Cb9",
  // "0x911E6364D7e6061fC3de135F75CAb9d61A6e5FA9",
  // "0x0E893541f9CFdf8Db2326720F0EbCAac411Ffd1E",
  // "0xe7aF00Befc5A93735710E21E8A5a6E3A3888bc7c",
  // "0xF3Ef97062FB59A8e6c460D9F267a162df4C20843",
  // "0x60959cdA4252b2E41055c81C648B5Af4eF53aD17",
  // "0x05863D02B228a048d467Ac7Ba8D8D42a1802DF2b",
  // "0xC297434911D5A22eeF2925a63E78D211A77C31C4",
  // "0x7666f37D4B861eccc7794eC4d86f5a86686135E9",
  // "0xad1270191afc38eB44947e37107cBca6765cabFe",
  // "0x5e878c5D016c123856ecFAeD7FA9625B39fF7c3c",
  // "0xCee8447dd036cdF5b5aeDa4FC8F880fdE479B13D",
  // "0x068BAb172FA62635DFB3cAbCF330EdbF63522cE4",
  // "0xBe469243177E4040F5C659B682733ABd2226d156",
  // "0xBe469243177E4040F5C659B682733ABd2226d156",
  // "0x832877b07a67EbE54f7c83E6cD561aB1e25bDa01",
  // "0xEE66195f7438012F8F3Dae456c090a794Af55CBF",
  // "0x654dd1ec75ce660899383f627882c7f3dfa8ffd0",
  // "0xfB33c8f8426Db534C0BA6494D4B9e824B390d658",
  // "0xf89941FEF5E65CA7337D9165F03304044C0612a8",
  // "0x98F6723C38eD4d49a4A374a65B98Cd9D2d47F9c2",
  // "0x2FC519190428c982D43Bbe1e7df9F639a91bC1d9",
  // "0x654dd1ec75ce660899383f627882c7f3dfa8ffd0",
  // "0xd15EFe11A5C005ccFD5b377067B54c71D421cc2B",
  // "0x040325b8bbAF8e894D4dC34B28415cD48C34Cb83",
  // "0x14e7502250De7297aB29aB5142C5AB0a460b03CA",
  // "0x2b3F0A1810A19250B76290Ed9b51cb9A518B3D95",
  // "0x0eC3D880fD1E0107bdaE95430B199add7E2F27fD",
  // "0xC895a83f22CFff38065b998968c2e2Ef4EB18413",
  // "0xa5967f7e0a732263b1561eC888f0387d5F7b7789",
  // "0x424BEb94dF6bd826a2e92a3C2C44C35257792d24",
  // "0xfaE50Dd6eE3CA1c7491786Ad5aB30D3Ee3982Cb9",
  // "0xda816828d3606F98f2187011ca7ceFD7fE4d2868",
  // "0x170631B2bC1C893cDEb274683f2999eF98437221",
  // "0x5D713Cf527e65c7aA6EB83AaA0f399e09Ffcd99a",
  // "0xd9b75d557821C5233fa6F4b78c936680263e8DA5",
  // "0xec2e7EE9437e3Bc0C0E94aaF573C3910Fa66160a",
  // "0x3048e95798Fac87D8eF240Da91Ce5EA7F7eF9e80",
  // "0x9f920a8c3307625aae5fd7e6647ae8a15d959092",
  // "0xC5E3868876F43a72Ee7492C6ed3538b47E97f6dd",
  // "0x4ca587D06FfA3D3FE2D83E6690cE228374906879",
  // "0xf7f71De0e7139De66fD0603b402EeCd6B3DaeAE3",
  // "0x4D24f3Fce02c19A8A776a404246ea5E1537EA553",
  // "0x53cF3645c491241B35c0a90ebfdE5b91A6bFc763",
  // "0xCEEEF01ef73FfA53D28a1A0fD85Fc602B5E60bd0",
  // "0x124f18f7001780dd4DCcc73BA649e926468de065",
  // "0xAeb17aE1a481be04380b321Fb464e9EeD8615Aaa",
  // "0x7898A866B011A1761639E14d93cFd72D04d1Ddef",
  // "0x026B2C1D3056ab0660e9416537feD07636A9E9Bc",
  // "0x47311fcD99cfb2F0764054b2546cBE0467d98fD2",
  // "0xd19677a52e2517751F1db3F1341D31FFa0066144",
  // "0xeaB466d01f673c200408c32291c15DDCE61aE928",
  // "0x071dfb36347B3Def1069bFC36cEFF0557e385e1a",
  // "0xE13A7e397697F9C2A717558b7F0d74Db54A88E14",
  // "0x62003019B2c71BA5C1B0Bcf86246B5ec1E8B8952",
  // "0x1CBb844ff59E66C23BAf7b2B86eb49105B054979",
  // "0x264EBdd59F1a46C9eDEdFeD174A1Eb140fb5e49a",
  // "0xCaDcc0f0f7C1FcC121bf2769da2d5EF0FCC0ECAA",
  // "0x00D27Df1E552C47E5F7ab62DC4138f977565Ec84",
  // "0x297Dfb66753dd2be08f977DeAb31f675418364b9",
  // "0x6435071C47A5F1dd9Ba225A48fa4381BE928Df17",
  // "0x5f5801a905503B1AEDE5E93924eB83746bFB2F1b",
  // "0xc84F151276b93a9c94B7642c738C9e5c4Cf6a316",
  // "0x48b9f15128cca0d092F254968FAbA2265dE6f0AF",
  // "0xdBF605dF6999Ed2d65985913f11B3075b30ccD8c",
  // "0x2aC7DaA7D494E55B5717684BE8da5C957b1692Bd",
  // "0x93c1ff68200506cE5e7E1707968F0ba9Cf76c433",
  // "0xDb457e5889f4d4c7ed2F443fF4003754582cf7FC",
  // "0x14656c7B1DB495f9efca0B6770d8306297FEe34A",
];

export function canCreateFarm(address: string) {
  const network = process.env.NETWORK as "mumbai" | "mainnet";
  if (network !== "mainnet") {
    return true;
  }
  return CREATE_FARM_WHITELIST.includes(address);
}

export function canSync(address: string) {
  const network = process.env.NETWORK as "mumbai" | "mainnet";
  if (network !== "mainnet") {
    return true;
  }
  return SYNC_WHITELIST.includes(address);
}

export function canMint(address: string) {
  const network = process.env.NETWORK as "mumbai" | "mainnet";
  if (network !== "mainnet") {
    return true;
  }
  return SYNC_WHITELIST.includes(address);
}
