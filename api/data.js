export default function handler(req, res) {
  // 1. ضع عنوان محفظتك هنا (نفس المحفظة التي ستوقع بها في خطوة Payout)
  const MY_WALLET = "0xCdeC68D734DdB064d6C11d5f2730c8F75C407503";

  const fullUrl = `https://${req.headers.host}${req.url}`;

  const x402Payload = {
    x402Version: 2,
    error: "PAYMENT-SIGNATURE header is required",
    resource: {
      url: fullUrl,
      description: "Returns live market status data. Takes no parameters.",
      mimeType: "application/json"
    },
    accepts: [
      {
        scheme: "exact",
        network: "eip155:8453", // شبكة Base Mainnet
        amount: "1000", // السعر: 0.001 USDC
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // عقد USDC الرسمي على Base
        payTo: MY_WALLET,
        maxTimeoutSeconds: 60,
        extra: {
          name: "USD Coin",
          version: "2"
        }
      }
    ]
  };

  // تشفير البيانات بصيغة Base64 للهيدر المطلوب في v2
  const base64Header = Buffer.from(JSON.stringify(x402Payload)).toString("base64");

  // إذا أرسل العميل إثبات دفع، نرد بالبيانات
  if (req.headers["payment-signature"]) {
    return res.status(200).json({ status: "success", data: "Premium API Response" });
  }

  // الرد الأساسي المطلوب لاجتياز فحص vAPI (كود 402 + الهيدر + JSON)
  res.setHeader("PAYMENT-REQUIRED", base64Header);
  res.setHeader("Content-Type", "application/json");
  return res.status(402).json(x402Payload);
}
