export interface LegalSection {
  title: string;
  body?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  subtitle?: string;
  sections: LegalSection[];
}

export const legalDocuments: LegalDocument[] = [
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    sections: [
      {
        title: "Introduction",
        body: [
          "Welcome to K3 Rankers Adda, an online learning platform providing coaching for JEE-MAIN, NEET and EAPCET for classes 11 and 12. In this platform we also provide coaching for IIT-JAM, APSET/TGSET and CSIR(UGC)-NET for Chemical Sciences subject.",
          "By registering and purchasing courses, users agree to these Terms and Conditions.",
        ],
      },
      {
        title: "Services Offered",
        bullets: [
          "Live online classes",
          "Recorded video lectures",
          "Mock tests and paper discussions",
          "Study materials",
          "Doubt clarification sessions",
        ],
      },
      {
        title: "User Registration",
        body: [
          "Students must provide accurate information during registration. Login credentials are personal and must not be shared.",
        ],
      },
      {
        title: "Payments",
        body: [
          "All payments are securely processed through Razorpay. Access to paid courses is granted only after successful payment confirmation.",
        ],
      },
      {
        title: "Course Access",
        bullets: [
          "Access validity depends on the purchased plan.",
          "Access is non-transferable.",
          "Sharing content or credentials may result in account suspension without refund.",
        ],
      },
      {
        title: "Intellectual Property",
        body: [
          "All videos, PDF files, tests and study materials are the intellectual property of K3 Rankers Adda and may not be copied or distributed.",
        ],
      },
      {
        title: "Code of Conduct",
        body: ["Students must behave respectfully during live classes and discussions."],
      },
      {
        title: "Limitation of Liability",
        body: [
          "We are not responsible for internet issues, device incompatibility, or third-party service interruptions.",
        ],
      },
      {
        title: "Modifications",
        body: ["We reserve the right to update courses, schedules, fees and policies at any time."],
      },
      {
        title: "Governing Law",
        body: ["These terms are governed by the laws of India."],
      },
      {
        title: "Contact Information",
        bullets: [
          "K3 Rankers Adda",
          "Email: k3rankersadda@gmail.com",
          "Phone: +91 9052181225",
          "Address: 6-70B, Uyyalawada, Orvakal, Kurnool, A.P., 518002.",
        ],
      },
    ],
  },
  {
    slug: "terms-and-conditions-for-teachers",
    title: "Terms and Conditions for Teachers",
    subtitle: "K3 Rankers Adda",
    sections: [
      {
        title: "Acceptance of Terms",
        body: [
          "By registering as a teacher on K3 Rankers Adda, you agree to comply with these terms and conditions. If you do not agree, you should not use the platform.",
        ],
      },
      {
        title: "Eligibility",
        bullets: [
          "Teachers must have relevant educational qualifications or teaching experience.",
          "You must provide accurate personal and professional details.",
          "K3 Rankers Adda reserves the right to approve or reject any application.",
        ],
      },
      {
        title: "Teacher Responsibilities",
        bullets: [
          "Deliver high-quality educational content for exams like JEE, NEET, EAPCET, etc.",
          "Maintain professionalism while interacting with students.",
          "Ensure content is original and not copied from copyrighted sources.",
          "Be punctual for live classes and meet deadlines for recorded content.",
        ],
      },
      {
        title: "Content Ownership and Rights",
        bullets: [
          "Teachers grant K3 Rankers Adda the right to use, modify, and distribute the content, including videos, PDFs and notes.",
          "Content created for the platform becomes platform property unless otherwise agreed.",
          "Teachers must not upload the same paid content on competing platforms without permission.",
        ],
      },
      {
        title: "Payment and Revenue Sharing",
        bullets: [
          "Teachers will be paid based on agreed terms, such as fixed salary, revenue share, or per-student basis.",
          "Payments will be processed on the agreed payment cycle.",
          "Any deductions, if applicable, will be clearly communicated.",
        ],
      },
      {
        title: "Code of Conduct",
        body: ["Teachers must not:"],
        bullets: [
          "Use abusive, offensive, or inappropriate language.",
          "Mislead students with false claims.",
          "Promote personal coaching or business without permission.",
          "Violation may lead to suspension or termination.",
        ],
      },
      {
        title: "Confidentiality",
        bullets: [
          "Teachers must not share platform data, student details, or internal strategies.",
          "Any breach of confidentiality may lead to legal action.",
        ],
      },
      {
        title: "Termination Policy",
        body: ["K3 Rankers Adda reserves the right to:"],
        bullets: [
          "Suspend or remove teachers for misconduct or poor performance.",
          "Terminate access without prior notice in serious cases.",
          "Teachers can also leave the platform with prior one-month notice.",
        ],
      },
      {
        title: "Intellectual Property Violation",
        bullets: [
          "If any content is found plagiarized or illegal, it will be removed immediately.",
          "The teacher will be fully responsible for legal consequences.",
        ],
      },
      {
        title: "Platform Rules",
        bullets: [
          "Teachers must follow class schedules and platform guidelines.",
          "Repeated cancellations or delays may affect continuation.",
        ],
      },
      {
        title: "Limitation of Liability",
        body: ["K3 Rankers Adda is not responsible for:"],
        bullets: [
          "Personal disputes between teacher and student.",
          "Technical issues beyond control.",
        ],
      },
      {
        title: "Changes to Terms",
        body: [
          "K3 Rankers Adda can update these terms anytime. Teachers will be notified of major changes.",
        ],
      },
      {
        title: "Contact",
        bullets: ["Email: k3rankersadda@gmail.com", "Phone: +91 9052181225"],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    sections: [
      {
        title: "Introduction",
        body: [
          "This Privacy Policy describes how K3 Rankers Adda collects, uses, stores, and protects personal information of students, parents, and users who access our online educational platform for JEE Main, NEET, EAMCET and other competitive exams like IIT-JAM, APSET/TGSET and CSIR(UGC)-NET.",
        ],
      },
      {
        title: "Information We Collect",
        body: [
          "We may collect names, email addresses, mobile numbers, student class details, payment information, device information, IP addresses, and app usage data.",
        ],
      },
      {
        title: "How We Use Information",
        body: [
          "We use collected information to create accounts, provide course access, process payments through Razorpay, communicate important updates, improve our services, and comply with legal obligations.",
        ],
      },
      {
        title: "Payment Information",
        body: [
          "Payments are securely processed by Razorpay. We do not store complete debit or credit card details on our servers.",
        ],
      },
      {
        title: "Sharing of Information",
        body: [
          "We do not sell personal information. Data may be shared with trusted service providers such as payment processors, hosting providers, and analytics services solely to operate the platform.",
        ],
      },
      {
        title: "Data Security",
        body: [
          "We implement reasonable administrative, technical, and physical safeguards to protect user data from unauthorized access, disclosure, or misuse.",
        ],
      },
      {
        title: "Children's Privacy",
        body: [
          "Because our services are intended for students, parents or guardians may create and manage accounts for minors. We handle student data responsibly and only for educational purposes.",
        ],
      },
      {
        title: "Cookies and Analytics",
        body: [
          "Our website and app may use cookies and analytics tools to understand usage patterns and improve the learning experience.",
        ],
      },
      {
        title: "User Rights",
        body: [
          "Users may request access to, correction of, or deletion of their personal information by contacting us.",
        ],
      },
      {
        title: "Data Retention",
        body: [
          "We retain information only as long as necessary to provide services, comply with legal obligations, and resolve disputes.",
        ],
      },
      {
        title: "Third-Party Links",
        body: [
          "Our platform may contain links to third-party websites. We are not responsible for their privacy practices.",
        ],
      },
      {
        title: "Changes to This Policy",
        body: [
          "We may update this Privacy Policy from time to time. The latest version will always be available within the app and on our website.",
        ],
      },
      {
        title: "Contact Information",
        bullets: [
          "Institute Name: K3 Rankers Adda",
          "Email: k3rankersadda@gmail.com",
          "Phone: +91 9052181225",
          "Address: 6-70B, Uyyalawada, Orvakal, Kurnool, A.P., 518002.",
        ],
      },
    ],
  },
  {
    slug: "refund-and-cancellation-policy",
    title: "Refund and Cancellation Policy",
    sections: [
      {
        title: "Digital Product Nature",
        body: [
          "All courses are digital educational services delivered instantly upon successful payment.",
        ],
      },
      {
        title: "Refund Eligibility",
        body: ["Refund requests will be considered only in the following cases:"],
        bullets: [
          "Duplicate payment.",
          "Payment deducted but course access not provided.",
          "Technical issues preventing course access that cannot be resolved.",
        ],
      },
      {
        title: "Non-Refundable Cases",
        body: ["No refunds will be provided in the following cases:"],
        bullets: [
          "After attending live classes.",
          "After accessing recorded videos, PDF files, or tests.",
          "Due to change of mind or thoughts.",
          "Due to poor internet connectivity or device technical issues.",
        ],
      },
      {
        title: "Refund Request Period",
        body: ["Refund requests must be submitted within 7 days of payment."],
      },
      {
        title: "Refund Processing Time",
        body: [
          "Approved refunds will be processed to the original payment method within 5-7 working days through Razorpay, without payment transaction charges.",
        ],
      },
      {
        title: "Cancellation",
        body: [
          "Once enrolled, course purchases cannot be cancelled after course access is granted. All courses and materials are delivered digitally through the mobile application after successful payment. No physical products are shipped.",
        ],
      },
    ],
  },
];

export const findLegalDocument = (slug = "") =>
  legalDocuments.find((document) => document.slug === slug);
