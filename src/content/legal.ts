// PLACEHOLDER legal text. Must be reviewed by a lawyer before launch (see FSD).
import type { Lang } from "@/i18n";

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { updated: string; sections: LegalSection[] };

const privacy: Record<Lang, LegalDoc> = {
  en: {
    updated: "2026-11-25",
    sections: [
      {
        heading: "1. Who we are",
        body: [
          "Maya (\"we\") gives professionals a free public page. This policy explains what personal data we collect, why, and the choices you have. It is written with India's Digital Personal Data Protection Act, 2023 (DPDP Act) in mind.",
        ],
      },
      {
        heading: "2. What we collect",
        body: [
          "Account data: your mobile number (with country code) or Google account email, used only to log you in.",
          "Page data: the details you choose to add to your page — name, profession, location, introduction, photos, services, prices, contact details, working hours and similar.",
          "Verification data (optional): document numbers you submit for a verification badge. These are never shown on your public page.",
        ],
      },
      {
        heading: "3. What is public",
        body: [
          "Everything you add to your page (except verification data) is public and can be seen by anyone with the link, and by search engines.",
        ],
      },
      {
        heading: "4. How we use your data",
        body: [
          "To create and show your page, to let you log in, and to generate your \"About\" text with an AI service when you ask for it. The one-line intro and basic page details are sent to our AI provider only for that purpose.",
          "We do not sell your personal data.",
        ],
      },
      {
        heading: "5. Your rights",
        body: [
          "You can see and edit all your data from your dashboard at any time.",
          "You can permanently delete your account and all your data from the dashboard (\"Delete my account and data\"). Your page goes offline immediately.",
          "For any question or complaint, contact our Grievance Officer: [name, email — to be added].",
        ],
      },
      {
        heading: "6. Where your data is stored",
        body: [
          "Data is stored with Google Firebase and our hosting provider. [Data location and processor details — to be added after legal review.]",
        ],
      },
    ],
  },
  hi: {
    updated: "2026-11-25",
    sections: [
      {
        heading: "1. हम कौन हैं",
        body: [
          "Maya (\"हम\") प्रोफ़ेशनल्स को एक मुफ़्त पब्लिक पेज देता है। यह पॉलिसी बताती है कि हम कौन-सा निजी डेटा लेते हैं, क्यों लेते हैं, और आपके पास क्या विकल्प हैं। इसे भारत के डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट, 2023 (DPDP एक्ट) को ध्यान में रखकर लिखा गया है।",
        ],
      },
      {
        heading: "2. हम क्या लेते हैं",
        body: [
          "अकाउंट डेटा: आपका मोबाइल नंबर (कंट्री कोड के साथ) या Google अकाउंट ईमेल, सिर्फ़ लॉग इन के लिए।",
          "पेज डेटा: जो जानकारी आप अपने पेज पर डालते हैं — नाम, पेशा, जगह, परिचय, फ़ोटो, सेवाएँ, रेट, संपर्क, काम का समय आदि।",
          "वेरिफ़िकेशन डेटा (वैकल्पिक): बैज के लिए दिए गए दस्तावेज़ नंबर। ये आपके पब्लिक पेज पर कभी नहीं दिखते।",
        ],
      },
      {
        heading: "3. क्या पब्लिक है",
        body: [
          "आपके पेज पर डाली गई हर जानकारी (वेरिफ़िकेशन डेटा को छोड़कर) पब्लिक है — लिंक वाला कोई भी व्यक्ति और सर्च इंजन इसे देख सकते हैं।",
        ],
      },
      {
        heading: "4. हम आपके डेटा का उपयोग कैसे करते हैं",
        body: [
          "आपका पेज बनाने और दिखाने, लॉग इन कराने, और आपके कहने पर AI से आपका \"परिचय\" लिखवाने के लिए। इसके लिए आपकी एक लाइन और पेज की बेसिक जानकारी हमारे AI प्रोवाइडर को भेजी जाती है।",
          "हम आपका निजी डेटा नहीं बेचते।",
        ],
      },
      {
        heading: "5. आपके अधिकार",
        body: [
          "आप डैशबोर्ड से कभी भी अपना सारा डेटा देख और बदल सकते हैं।",
          "आप डैशबोर्ड से (\"मेरा अकाउंट और डेटा डिलीट करें\") अपना अकाउंट और सारा डेटा हमेशा के लिए डिलीट कर सकते हैं। आपका पेज तुरंत ऑफ़लाइन हो जाएगा।",
          "किसी भी सवाल या शिकायत के लिए हमारे ग्रीवेंस ऑफ़िसर से संपर्क करें: [नाम, ईमेल — जोड़ा जाना है]।",
        ],
      },
      {
        heading: "6. आपका डेटा कहाँ रखा जाता है",
        body: [
          "डेटा Google Firebase और हमारे होस्टिंग प्रोवाइडर के पास रखा जाता है। [डेटा लोकेशन और प्रोसेसर की जानकारी — कानूनी जाँच के बाद जोड़ी जाएगी।]",
        ],
      },
    ],
  },
};

const terms: Record<Lang, LegalDoc> = {
  en: {
    updated: "2026-11-25",
    sections: [
      {
        heading: "1. The service",
        body: [
          "Maya gives professionals a free public web page. We may change or stop features at any time.",
        ],
      },
      {
        heading: "2. Your account",
        body: [
          "You must be at least 18 years old. You are responsible for keeping access to your phone number or Google account safe.",
        ],
      },
      {
        heading: "3. Your content",
        body: [
          "You own what you put on your page. You give Maya permission to show it publicly as part of your page.",
          "You must only add true information about yourself and content you have the right to use. Do not pretend to be someone else, and do not post illegal, misleading or offensive content.",
          "AI-written text is a suggestion. Please read and correct it before publishing — you are responsible for what your page says.",
        ],
      },
      {
        heading: "4. Removing pages",
        body: [
          "We may remove pages or page links that break these terms or the law. You can delete your page and account any time from your dashboard.",
        ],
      },
      {
        heading: "5. No guarantees",
        body: [
          "Maya is provided \"as is\". We do not guarantee enquiries, customers or uninterrupted service. [Liability limits and governing law — to be added after legal review.]",
        ],
      },
    ],
  },
  hi: {
    updated: "2026-11-25",
    sections: [
      {
        heading: "1. सेवा",
        body: [
          "Maya प्रोफ़ेशनल्स को एक मुफ़्त पब्लिक वेब पेज देता है। हम किसी भी समय फ़ीचर बदल या बंद कर सकते हैं।",
        ],
      },
      {
        heading: "2. आपका अकाउंट",
        body: [
          "आपकी उम्र कम से कम 18 साल होनी चाहिए। अपने फ़ोन नंबर या Google अकाउंट को सुरक्षित रखना आपकी ज़िम्मेदारी है।",
        ],
      },
      {
        heading: "3. आपका कंटेंट",
        body: [
          "आपके पेज का कंटेंट आपका है। आप Maya को उसे आपके पेज पर पब्लिक दिखाने की अनुमति देते हैं।",
          "सिर्फ़ अपने बारे में सही जानकारी और वही कंटेंट डालें जिसका आपको अधिकार है। किसी और के नाम से पेज न बनाएँ, और गैरकानूनी, भ्रामक या आपत्तिजनक कंटेंट न डालें।",
          "AI से लिखा टेक्स्ट सिर्फ़ एक सुझाव है। पब्लिश करने से पहले उसे पढ़ें और ठीक करें — आपके पेज पर क्या लिखा है, इसकी ज़िम्मेदारी आपकी है।",
        ],
      },
      {
        heading: "4. पेज हटाना",
        body: [
          "इन शर्तों या कानून का उल्लंघन करने वाले पेज या लिंक हम हटा सकते हैं। आप डैशबोर्ड से कभी भी अपना पेज और अकाउंट डिलीट कर सकते हैं।",
        ],
      },
      {
        heading: "5. कोई गारंटी नहीं",
        body: [
          "Maya जैसा है वैसा दिया जाता है। हम पूछताछ, ग्राहक या बिना रुकावट सेवा की गारंटी नहीं देते। [देयता की सीमा और लागू कानून — कानूनी जाँच के बाद जोड़े जाएँगे।]",
        ],
      },
    ],
  },
};

export const legalDocs = { privacy, terms };
