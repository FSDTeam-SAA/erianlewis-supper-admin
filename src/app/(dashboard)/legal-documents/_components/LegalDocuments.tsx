// "use client";
// import { useMutation } from "@tanstack/react-query";
// import dynamic from "next/dynamic";
// import { useSession } from "next-auth/react";
// import React, { useState } from "react";
// import { toast } from "sonner";
// import "react-quill-new/dist/quill.snow.css";

// type TabType = "support" | "legal";
// type ExpandedSectionType =
//   | "contact"
//   | "social"
//   | "kb"
//   | "privacy"
//   | "license"
//   | null;
// type DocTabType = "text" | "pdf";

// interface SocialItem {
//   id: string;
//   name: string;
//   placeholder: string;
//   enabled: boolean;
//   url: string;
// }

// interface SettingsUpdatePayload {
//   contactSupport: {
//     phoneNumbers: string[];
//     emailAddresses: string[];
//   };
//   socialLinks: {
//     facebook: { url: string; enabled: boolean };
//     instagram: { url: string; enabled: boolean };
//     tiktok: { url: string; enabled: boolean };
//     linkedin: { url: string; enabled: boolean };
//     youtube: { url: string; enabled: boolean };
//   };
//   knowledgeBase: {
//     url: string;
//   };
//   termsOfServiceText: string;
//   privacyPolicyText: string;
//   licensingInformationText: string;
// }

// const SOCIALS: Omit<SocialItem, "enabled" | "url">[] = [
//   {
//     id: "fb",
//     name: "Facebook",
//     placeholder: "https://facebook.com/yourusername",
//   },
//   {
//     id: "ig",
//     name: "Instagram",
//     placeholder: "https://instagram.com/yourusername",
//   },
//   { id: "tt", name: "TikTok", placeholder: "https://tiktok.com/yourusername" },
//   {
//     id: "li",
//     name: "LinkedIn",
//     placeholder: "https://linkedin.com/yourusername",
//   },
//   {
//     id: "yt",
//     name: "YouTube",
//     placeholder: "https://youtube.com/yourusername",
//   },
// ];

// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
// const quillModules = {
//   toolbar: [
//     [{ header: [1, 2, 3, false] }],
//     ["bold", "italic", "underline", "strike"],
//     [{ list: "ordered" }, { list: "bullet" }],
//     [{ align: [] }],
//     ["link", "blockquote"],
//     ["clean"],
//   ],
// };
// const quillFormats = [
//   "header",
//   "bold",
//   "italic",
//   "underline",
//   "strike",
//   "list",
//   "align",
//   "link",
//   "blockquote",
// ];

// // ─── Icons ────────────────────────────────────────────────────────────────────
// const MailIcon = () => (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#dc2626"
//     strokeWidth="2"
//   >
//     <rect x="2" y="4" width="20" height="16" rx="2" />
//     <path d="m22 7-10 7L2 7" />
//   </svg>
// );
// const ShareIcon = () => (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#dc2626"
//     strokeWidth="2"
//   >
//     <circle cx="18" cy="5" r="3" />
//     <circle cx="6" cy="12" r="3" />
//     <circle cx="18" cy="19" r="3" />
//     <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
//     <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
//   </svg>
// );
// const BookIcon = () => (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#dc2626"
//     strokeWidth="2"
//   >
//     <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
//     <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
//   </svg>
// );
// const ScalesIcon = () => (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#dc2626"
//     strokeWidth="2"
//   >
//     <path d="M12 2L2 7l10 5 10-5-10-5z" />
//     <path d="M2 17l10 5 10-5" />
//     <path d="M2 12l10 5 10-5" />
//   </svg>
// );
// const ShieldIcon = () => (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#dc2626"
//     strokeWidth="2"
//   >
//     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//   </svg>
// );
// const InfoIcon = () => (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="#dc2626"
//     strokeWidth="2"
//   >
//     <circle cx="12" cy="12" r="10" />
//     <line x1="12" y1="8" x2="12" y2="12" />
//     <line x1="12" y1="16" x2="12.01" y2="16" />
//   </svg>
// );
// const SaveIcon = () => (
//   <svg
//     width="14"
//     height="14"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//   >
//     <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
//     <polyline points="17 21 17 13 7 13 7 21" />
//     <polyline points="7 3 7 8 15 8" />
//   </svg>
// );
// const XIcon = () => (
//   <svg
//     width="14"
//     height="14"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//   >
//     <line x1="18" y1="6" x2="6" y2="18" />
//     <line x1="6" y1="6" x2="18" y2="18" />
//   </svg>
// );

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const IconWrap = ({ children }: { children: React.ReactNode }) => (
//   <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
//     {children}
//   </div>
// );

// const StatusBadge = ({ configured }: { configured: boolean }) => (
//   <p
//     className={`text-xs mb-4 ${configured ? "text-green-600" : "text-gray-400"}`}
//   >
//     {configured ? "Configured" : "Not Configured"}
//   </p>
// );

// const RedButton = ({
//   onClick,
//   children,
// }: {
//   onClick: () => void;
//   children: React.ReactNode;
// }) => (
//   <button
//     onClick={onClick}
//     className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
//   >
//     {children}
//   </button>
// );

// const SaveButton = ({ onClick }: { onClick: () => void }) => (
//   <button
//     onClick={onClick}
//     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
//   >
//     <SaveIcon /> Save
//   </button>
// );

// const CancelButton = ({ onClick }: { onClick: () => void }) => (
//   <button
//     onClick={onClick}
//     className="flex items-center gap-2 border border-gray-300 text-gray-500 hover:bg-gray-50 font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
//   >
//     <XIcon /> Cancel
//   </button>
// );

// // ─── Doc Tab Switcher ──────────────────────────────────────────────────────────
// const DocTabSwitcher = ({
//   active,
//   onChange,
//   textarea,
//   pdfInput,
// }: {
//   active: DocTabType;
//   onChange: (t: DocTabType) => void;
//   textarea: React.ReactNode;
//   pdfInput?: React.ReactNode;
// }) => (
//   <>
//     <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-3">
//       <button
//         className={`flex-1 py-2 text-sm font-medium transition-colors ${active === "text" ? "bg-red-600 text-white" : "bg-gray-50 text-gray-500"}`}
//         onClick={() => onChange("text")}
//       >
//         Text Input
//       </button>
//       <button
//         className={`flex-1 py-2 text-sm font-medium transition-colors ${active === "pdf" ? "bg-red-600 text-white" : "bg-gray-50 text-gray-500"}`}
//         onClick={() => onChange("pdf")}
//       >
//         Upload PDF
//       </button>
//     </div>
//     {active === "text"
//       ? textarea
//       : pdfInput || (
//           <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 mb-3">
//             Click to upload PDF file
//           </div>
//         )}
//   </>
// );

// // ─── Toggle ────────────────────────────────────────────────────────────────────
// const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
//   <button
//     onClick={onToggle}
//     className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-green-500" : "bg-gray-300"}`}
//   >
//     <span
//       className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${on ? "left-5" : "left-1"}`}
//     />
//   </button>
// );

// // ─── Main Component ────────────────────────────────────────────────────────────
// export default function LegalDocuments() {
//   const { data: session } = useSession();
//   const token = session?.user?.accessToken;
//   const [tab, setTab] = useState<TabType>("support");
//   const [expandedSection, setExpandedSection] =
//     useState<ExpandedSectionType>(null);

//   // Contact Support state
//   const [phones, setPhones] = useState([""]);
//   const [emails, setEmails] = useState([""]);
//   const [contactConfigured, setContactConfigured] = useState(false);

//   // Social state
//   const [socials, setSocials] = useState<SocialItem[]>(
//     SOCIALS.map((s) => ({ ...s, enabled: false, url: "" })),
//   );
//   const [socialConfigured, setSocialConfigured] = useState(false);

//   // Knowledge Base state
//   const [kbUrl, setKbUrl] = useState("");
//   const [kbConfigured, setKbConfigured] = useState(false);

//   // Legal doc state
//   const [tosTab, setTosTab] = useState<DocTabType>("text");
//   const [tosText, setTosText] = useState(
//     "TERMS OF SERVICE\n\nAlora Platform\nOwned and Operated by Northgate Support Services LLC\n\n1. Introduction",
//   );
//   const [ppTab, setPpTab] = useState<DocTabType>("text");
//   const [ppText, setPpText] = useState(
//     "PRIVACY POLICY\n\nAlora Platform\nOwned and Operated by Northgate Support Services LLC\n\n1. Introduction",
//   );
//   const [licTab, setLicTab] = useState<DocTabType>("text");
//   const [licText, setLicText] = useState("");
//   const [licConfigured, setLicConfigured] = useState(false);
//   const [tosPdfFile, setTosPdfFile] = useState<File | null>(null);
//   const [ppPdfFile, setPpPdfFile] = useState<File | null>(null);
//   const [licPdfFile, setLicPdfFile] = useState<File | null>(null);

//   const closeExpandedSection = () => setExpandedSection(null);

//   const getSocial = (id: string) => socials.find((s) => s.id === id);

//   const buildSettingsPayload = (): SettingsUpdatePayload => ({
//     contactSupport: {
//       phoneNumbers: phones.map((p) => p.trim()).filter(Boolean),
//       emailAddresses: emails.map((e) => e.trim()).filter(Boolean),
//     },
//     socialLinks: {
//       facebook: {
//         url: getSocial("fb")?.url?.trim() || "",
//         enabled: !!getSocial("fb")?.enabled,
//       },
//       instagram: {
//         url: getSocial("ig")?.url?.trim() || "",
//         enabled: !!getSocial("ig")?.enabled,
//       },
//       tiktok: {
//         url: getSocial("tt")?.url?.trim() || "",
//         enabled: !!getSocial("tt")?.enabled,
//       },
//       linkedin: {
//         url: getSocial("li")?.url?.trim() || "",
//         enabled: !!getSocial("li")?.enabled,
//       },
//       youtube: {
//         url: getSocial("yt")?.url?.trim() || "",
//         enabled: !!getSocial("yt")?.enabled,
//       },
//     },
//     knowledgeBase: {
//       url: kbUrl.trim(),
//     },
//     termsOfServiceText: tosText,
//     privacyPolicyText: ppText,
//     licensingInformationText: licText,
//   });

//   const buildSettingsFormData = () => {
//     const payload = buildSettingsPayload();
//     const formData = new FormData();
//     formData.append("contactSupport", JSON.stringify(payload.contactSupport));
//     formData.append("socialLinks", JSON.stringify(payload.socialLinks));
//     formData.append("knowledgeBase", JSON.stringify(payload.knowledgeBase));
//     formData.append("termsOfServiceText", payload.termsOfServiceText);
//     formData.append("privacyPolicyText", payload.privacyPolicyText);
//     formData.append(
//       "licensingInformationText",
//       payload.licensingInformationText,
//     );

//     if (tosPdfFile) {
//       formData.append("termsOfServicePdf", tosPdfFile);
//     }
//     if (ppPdfFile) {
//       formData.append("privacyPolicyPdf", ppPdfFile);
//     }
//     if (licPdfFile) {
//       formData.append("licensingInformationPdf", licPdfFile);
//     }

//     return formData;
//   };

//   const updatemutation = useMutation({
//     mutationFn: async ({
//       body,
//       isFormData,
//     }: {
//       body: SettingsUpdatePayload | FormData;
//       isFormData: boolean;
//     }) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/settings`,
//         {
//           method: "PUT",
//           headers: {
//             ...(!isFormData ? { "Content-Type": "application/json" } : {}),
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//           body: isFormData ? (body as FormData) : JSON.stringify(body),
//         },
//       );

//       const json = await res.json();
//       if (!res.ok || !json?.status) {
//         throw new Error(json?.message || "Failed to update settings");
//       }

//       return json?.data;
//     },
//   });

//   const saveAllSettings = async (onSuccess: () => void) => {
//     try {
//       const shouldSendFormData =
//         (tosTab === "pdf" && !!tosPdfFile) ||
//         (ppTab === "pdf" && !!ppPdfFile) ||
//         (licTab === "pdf" && !!licPdfFile);

//       await updatemutation.mutateAsync({
//         body: shouldSendFormData
//           ? buildSettingsFormData()
//           : buildSettingsPayload(),
//         isFormData: shouldSendFormData,
//       });
//       toast.success("Settings updated successfully");
//       onSuccess();
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to update settings";
//       toast.error(message);
//       // keep current section open on error
//     }
//   };

//   // ── Contact Support helpers
//   const addPhone = () => setPhones([...phones, ""]);
//   const addEmail = () => setEmails([...emails, ""]);
//   const saveContact = () => {
//     saveAllSettings(() => {
//       setContactConfigured(true);
//       closeExpandedSection();
//     });
//   };

//   // ── Social helpers
//   const toggleSocial = (id: string) =>
//     setSocials(
//       socials.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
//     );
//   const updateSocialUrl = (id: string, url: string) =>
//     setSocials(socials.map((s) => (s.id === id ? { ...s, url } : s)));
//   const saveSocial = () => {
//     saveAllSettings(() => {
//       setSocialConfigured(true);
//       closeExpandedSection();
//     });
//   };

//   // ── KB helpers
//   const saveKb = () => {
//     saveAllSettings(() => {
//       if (kbUrl.trim()) setKbConfigured(true);
//       closeExpandedSection();
//     });
//   };

//   const saveTerms = () => {
//     if (tosTab === "pdf" && !tosPdfFile) {
//       toast.error("Please select a PDF file for Terms of Service");
//       return;
//     }
//     saveAllSettings(() => {
//       closeExpandedSection();
//     });
//   };

//   const savePrivacy = () => {
//     if (ppTab === "pdf" && !ppPdfFile) {
//       toast.error("Please select a PDF file for Privacy Policy");
//       return;
//     }
//     saveAllSettings(() => {
//       closeExpandedSection();
//     });
//   };

//   const saveLicense = () => {
//     if (licTab === "pdf" && !licPdfFile) {
//       toast.error("Please select a PDF file for Licensing Information");
//       return;
//     }
//     saveAllSettings(() => {
//       setLicConfigured(true);
//       closeExpandedSection();
//     });
//   };

//   const handleTermsImageUpload = () => {
//     const input = document.createElement("input");
//     input.setAttribute("type", "file");
//     input.setAttribute("accept", "image/*");
//     input.click();

//     input.onchange = () => {
//       const file = input.files?.[0];
//       if (!file) return;

//       if (!file.type.startsWith("image/")) {
//         toast.error("Please select a valid image file");
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = () => {
//         const imageSrc = typeof reader.result === "string" ? reader.result : "";
//         if (!imageSrc) return;
//         setTosText(
//           (prev) =>
//             `${prev}<p><img src="${imageSrc}" alt="uploaded image" /></p>`,
//         );
//       };
//       reader.readAsDataURL(file);
//     };
//   };

//   const termsQuillModules = {
//     toolbar: {
//       container: [
//         [{ header: [1, 2, 3, false] }],
//         ["bold", "italic", "underline", "strike"],
//         [{ list: "ordered" }, { list: "bullet" }],
//         [{ align: [] }],
//         ["link", "image", "blockquote"],
//         ["clean"],
//       ],
//       handlers: {
//         image: handleTermsImageUpload,
//       },
//     },
//   };

//   const termsQuillFormats = [...quillFormats, "image"];

//   return (
//     <div className="p-6 min-h-screen bg-gray-50">
//       <div className="container mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-semibold text-gray-900">
//             Legal & Policy Control Center
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Manage support resources and legal documentation for your platform
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-gray-200 mb-6">
//           {(["support", "legal"] as TabType[]).map((t) => (
//             <button
//               key={t}
//               onClick={() => setTab(t)}
//               className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
//                 tab === t
//                   ? "border-red-600 text-red-600"
//                   : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               {t === "support" ? "Support & Resources" : "Legal"}
//             </button>
//           ))}
//         </div>

//         {/* ── Support Tab ── */}
//         {tab === "support" && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {/* Contact Support */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
//               <div className="flex items-center gap-3 mb-2">
//                 <IconWrap>
//                   <MailIcon />
//                 </IconWrap>
//                 <span className="font-semibold text-gray-900">
//                   Contact Support
//                 </span>
//               </div>
//               <StatusBadge configured={contactConfigured} />
//               {expandedSection !== "contact" ? (
//                 <RedButton onClick={() => setExpandedSection("contact")}>
//                   Configure
//                 </RedButton>
//               ) : (
//                 <>
//                   <p className="text-sm font-medium text-gray-700 mb-2">
//                     Phone Numbers
//                   </p>
//                   {phones.map((ph, i) => (
//                     <div key={i} className="flex gap-2 mb-2">
//                       <input
//                         value={ph}
//                         onChange={(e) => {
//                           const next = [...phones];
//                           next[i] = e.target.value;
//                           setPhones(next);
//                         }}
//                         placeholder="(555) 123-4567"
//                         className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
//                       />
//                       <button
//                         onClick={addPhone}
//                         className="w-9 h-9 bg-red-600 text-white rounded-lg text-xl flex items-center justify-center hover:bg-red-700"
//                       >
//                         +
//                       </button>
//                     </div>
//                   ))}

//                   <p className="text-sm font-medium text-gray-700 mb-2 mt-3">
//                     Email Addresses
//                   </p>
//                   {emails.map((em, i) => (
//                     <div key={i} className="flex gap-2 mb-2">
//                       <input
//                         value={em}
//                         onChange={(e) => {
//                           const next = [...emails];
//                           next[i] = e.target.value;
//                           setEmails(next);
//                         }}
//                         placeholder="Support@example.com"
//                         className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
//                       />
//                       <button
//                         onClick={addEmail}
//                         className="w-9 h-9 bg-red-600 text-white rounded-lg text-xl flex items-center justify-center hover:bg-red-700"
//                       >
//                         +
//                       </button>
//                     </div>
//                   ))}

//                   <div className="flex gap-2 mt-4">
//                     <SaveButton onClick={saveContact} />
//                     <CancelButton onClick={closeExpandedSection} />
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Manage Social */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
//               <div className="flex items-center gap-3 mb-2">
//                 <IconWrap>
//                   <ShareIcon />
//                 </IconWrap>
//                 <span className="font-semibold text-gray-900">
//                   Manage Social
//                 </span>
//               </div>
//               <StatusBadge configured={socialConfigured} />
//               {expandedSection !== "social" ? (
//                 <RedButton onClick={() => setExpandedSection("social")}>
//                   Configure
//                 </RedButton>
//               ) : (
//                 <>
//                   {socials.map((s) => (
//                     <div key={s.id} className="mb-4">
//                       <div className="flex items-center justify-between mb-1.5">
//                         <span className="text-sm font-medium text-gray-700">
//                           {s.name}
//                         </span>
//                         <Toggle
//                           on={s.enabled}
//                           onToggle={() => toggleSocial(s.id)}
//                         />
//                       </div>
//                       <input
//                         value={s.url}
//                         onChange={(e) => updateSocialUrl(s.id, e.target.value)}
//                         placeholder={s.placeholder}
//                         className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
//                       />
//                     </div>
//                   ))}

//                   <div className="flex gap-2 mt-2">
//                     <SaveButton onClick={saveSocial} />
//                     <CancelButton onClick={closeExpandedSection} />
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Knowledge Base */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
//               <div className="flex items-center gap-3 mb-2">
//                 <IconWrap>
//                   <BookIcon />
//                 </IconWrap>
//                 <span className="font-semibold text-gray-900">
//                   Knowledge Base
//                 </span>
//               </div>
//               <StatusBadge configured={kbConfigured} />
//               {expandedSection !== "kb" ? (
//                 <RedButton onClick={() => setExpandedSection("kb")}>
//                   Configure
//                 </RedButton>
//               ) : (
//                 <>
//                   <input
//                     value={kbUrl}
//                     onChange={(e) => setKbUrl(e.target.value)}
//                     placeholder="Enter Knowledge Base URL (eg, https://help.yoursite.com)"
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 mb-4"
//                   />

//                   <div className="flex gap-2">
//                     <SaveButton onClick={saveKb} />
//                     <CancelButton onClick={closeExpandedSection} />
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── Legal Tab ── */}
//         {tab === "legal" && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {/* Terms of Service */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
//               <div className="flex items-center gap-3 mb-2">
//                 <IconWrap>
//                   <ScalesIcon />
//                 </IconWrap>
//                 <span className="font-semibold text-gray-900">
//                   Terms of Service
//                 </span>
//               </div>
//               <p className="text-xs text-green-600 mb-1">Configured</p>
//               <p className="text-xs text-gray-400 mb-3">
//                 Last edited by System · 1/8/2026, 12:47:53 AM
//               </p>
//               <DocTabSwitcher
//                 active={tosTab}
//                 onChange={setTosTab}
//                 textarea={
//                   <div className="legal-quill mb-3">
//                     <ReactQuill
//                       theme="snow"
//                       value={tosText}
//                       onChange={setTosText}
//                       modules={termsQuillModules}
//                       formats={termsQuillFormats}
//                       placeholder="Write terms of service..."
//                     />
//                   </div>
//                 }
//                 pdfInput={
//                   <label className="block cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-6 text-center mb-3 transition-colors">
//                     <input
//                       type="file"
//                       accept="application/pdf"
//                       className="hidden"
//                       onChange={(e) =>
//                         setTosPdfFile(e.target.files?.[0] || null)
//                       }
//                     />
//                     <p className="text-sm text-gray-600">
//                       {tosPdfFile
//                         ? tosPdfFile.name
//                         : "Click to select Terms of Service PDF"}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">
//                       Only .pdf file supported
//                     </p>
//                   </label>
//                 }
//               />
//               <div className="flex gap-2">
//                 <SaveButton onClick={saveTerms} />
//                 <CancelButton onClick={closeExpandedSection} />
//               </div>
//             </div>

//             {/* Privacy Policy */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
//               <div className="flex items-center gap-3 mb-2">
//                 <IconWrap>
//                   <ShieldIcon />
//                 </IconWrap>
//                 <span className="font-semibold text-gray-900">
//                   Privacy Policy
//                 </span>
//               </div>
//               <p className="text-xs text-green-600 mb-1">Configured</p>
//               <p className="text-xs text-gray-400 mb-3">
//                 Last edited by System · 1/8/2026, 12:47:53 AM
//               </p>
//               {expandedSection !== "privacy" ? (
//                 <>
//                   <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 mb-3 min-h-[80px] max-h-[140px] overflow-hidden">
//                     <div
//                       className="text-xs text-gray-600 leading-relaxed [&_p]:mb-2 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_li]:mb-1"
//                       dangerouslySetInnerHTML={{
//                         __html: ppText || "<p>No preview available</p>",
//                       }}
//                     />
//                   </div>
//                   <RedButton onClick={() => setExpandedSection("privacy")}>
//                     Configure
//                   </RedButton>
//                 </>
//               ) : (
//                 <>
//                   <DocTabSwitcher
//                     active={ppTab}
//                     onChange={setPpTab}
//                     textarea={
//                       <div className="legal-quill mb-3">
//                         <ReactQuill
//                           theme="snow"
//                           value={ppText}
//                           onChange={setPpText}
//                           modules={quillModules}
//                           formats={quillFormats}
//                           placeholder="Write privacy policy..."
//                         />
//                       </div>
//                     }
//                     pdfInput={
//                       <label className="block cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-6 text-center mb-3 transition-colors">
//                         <input
//                           type="file"
//                           accept="application/pdf"
//                           className="hidden"
//                           onChange={(e) =>
//                             setPpPdfFile(e.target.files?.[0] || null)
//                           }
//                         />
//                         <p className="text-sm text-gray-600">
//                           {ppPdfFile
//                             ? ppPdfFile.name
//                             : "Click to select Privacy Policy PDF"}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           Only .pdf file supported
//                         </p>
//                       </label>
//                     }
//                   />

//                   <div className="flex gap-2">
//                     <SaveButton onClick={savePrivacy} />
//                     <CancelButton onClick={closeExpandedSection} />
//                   </div>
//                 </>
//               )}
//             </div>

//             {/* Licensing Information */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
//               <div className="flex items-center gap-3 mb-2">
//                 <IconWrap>
//                   <InfoIcon />
//                 </IconWrap>
//                 <span className="font-semibold text-gray-900">
//                   Licensing Information
//                 </span>
//               </div>
//               <StatusBadge configured={licConfigured} />
//               {expandedSection !== "license" ? (
//                 <RedButton onClick={() => setExpandedSection("license")}>
//                   Configure
//                 </RedButton>
//               ) : (
//                 <>
//                   <DocTabSwitcher
//                     active={licTab}
//                     onChange={setLicTab}
//                     textarea={
//                       <div className="legal-quill mb-3">
//                         <ReactQuill
//                           theme="snow"
//                           value={licText}
//                           onChange={setLicText}
//                           modules={quillModules}
//                           formats={quillFormats}
//                           placeholder="Enter licensing information..."
//                         />
//                       </div>
//                     }
//                     pdfInput={
//                       <label className="block cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-6 text-center mb-3 transition-colors">
//                         <input
//                           type="file"
//                           accept="application/pdf"
//                           className="hidden"
//                           onChange={(e) =>
//                             setLicPdfFile(e.target.files?.[0] || null)
//                           }
//                         />
//                         <p className="text-sm text-gray-600">
//                           {licPdfFile
//                             ? licPdfFile.name
//                             : "Click to select Licensing Information PDF"}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           Only .pdf file supported
//                         </p>
//                       </label>
//                     }
//                   />

//                   <div className="flex gap-2">
//                     <SaveButton onClick={saveLicense} />
//                     <CancelButton onClick={closeExpandedSection} />
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//       <style jsx global>{`
//         .legal-quill .ql-toolbar.ql-snow {
//           border: 1px solid #e5e7eb;
//           border-radius: 10px 10px 0 0;
//           background: #f9fafb;
//         }
//         .legal-quill .ql-container.ql-snow {
//           border: 1px solid #e5e7eb;
//           border-top: 0;
//           border-radius: 0 0 10px 10px;
//         }
//         .legal-quill .ql-editor {
//           min-height: 180px;
//           color: #374151;
//           font-size: 13px;
//           line-height: 1.6;
//         }
//         .legal-quill .ql-editor.ql-blank::before {
//           color: #9ca3af;
//           font-style: normal;
//         }
//         .legal-quill .ql-toolbar .ql-picker-label:hover,
//         .legal-quill .ql-toolbar button:hover {
//           color: #dc2626;
//         }
//       `}</style>
//     </div>
//   );
// }

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";

type TabType = "support" | "legal";
type ExpandedSectionType =
  | "contact"
  | "social"
  | "kb"
  | "privacy"
  | "license"
  | null;
type DocTabType = "text" | "pdf";

interface SocialItem {
  id: string;
  name: string;
  placeholder: string;
  enabled: boolean;
  url: string;
}

interface SettingsData {
  contactSupport?: {
    phoneNumbers: string[];
    emailAddresses: string[];
  };
  socialLinks?: {
    facebook: { url: string; enabled: boolean };
    instagram: { url: string; enabled: boolean };
    tiktok: { url: string; enabled: boolean };
    linkedin: { url: string; enabled: boolean };
    youtube: { url: string; enabled: boolean };
  };
  knowledgeBase?: {
    url: string;
  };
  termsOfServiceText?: string;
  privacyPolicyText?: string;
  licensingInformationText?: string;
}

type SettingsMutationBody = Record<string, unknown> | FormData;

function useSettingsMutation(endpoint: string, token?: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SettingsMutationBody>({
    mutationFn: async (body) => {
      const isFormData = body instanceof FormData;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${endpoint}`,
        {
          method: "PUT",
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: isFormData ? body : JSON.stringify(body),
        },
      );
      const json = (await res.json()) as { status?: boolean; message?: string };
      if (!res.ok || !json?.status) {
        throw new Error(json?.message || "Failed to update");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error) => toast.error(error.message || "Save failed"),
  });
}

function buildDocumentFormData(
  textField: string,
  textValue: string,
  fileField: [string, File],
) {
  const formData = new FormData();
  formData.append(textField, textValue);
  formData.append(fileField[0], fileField[1]);
  return formData;
}

// Dynamic Quill Editor
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "blockquote"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "align",
  "link",
  "blockquote",
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 7L2 7" />
  </svg>
);
const ShareIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const BookIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const ScalesIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const SaveIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── UI Components ───────────────────────────────────────────────────────────
const IconWrap = ({ children }: { children: React.ReactNode }) => (
  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
    {children}
  </div>
);

const StatusBadge = ({ configured }: { configured: boolean }) => (
  <p
    className={`text-xs mb-4 ${configured ? "text-green-600" : "text-gray-400"}`}
  >
    {configured ? "Configured" : "Not Configured"}
  </p>
);

const RedButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
  >
    {children}
  </button>
);

const SaveButton = ({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
  >
    <SaveIcon /> Save
  </button>
);

const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 border border-gray-300 text-gray-500 hover:bg-gray-50 font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
  >
    <XIcon /> Cancel
  </button>
);

const DocTabSwitcher = ({
  active,
  onChange,
  textarea,
  pdfInput,
}: {
  active: DocTabType;
  onChange: (t: DocTabType) => void;
  textarea: React.ReactNode;
  pdfInput?: React.ReactNode;
}) => (
  <>
    <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        className={`flex-1 py-2 text-sm font-medium transition-colors ${active === "text" ? "bg-red-600 text-white" : "bg-gray-50 text-gray-500"}`}
        onClick={() => onChange("text")}
      >
        Text Input
      </button>
      <button
        className={`flex-1 py-2 text-sm font-medium transition-colors ${active === "pdf" ? "bg-red-600 text-white" : "bg-gray-50 text-gray-500"}`}
        onClick={() => onChange("pdf")}
      >
        Upload PDF
      </button>
    </div>
    {active === "text" ? textarea : pdfInput}
  </>
);

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-green-500" : "bg-gray-300"}`}
  >
    <span
      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${on ? "left-5" : "left-1"}`}
    />
  </button>
);

// ─── SOCIALS Config ─────────────────────────────────────────────────────────
const SOCIALS: Omit<SocialItem, "enabled" | "url">[] = [
  {
    id: "fb",
    name: "Facebook",
    placeholder: "https://facebook.com/yourusername",
  },
  {
    id: "ig",
    name: "Instagram",
    placeholder: "https://instagram.com/yourusername",
  },
  { id: "tt", name: "TikTok", placeholder: "https://tiktok.com/yourusername" },
  {
    id: "li",
    name: "LinkedIn",
    placeholder: "https://linkedin.com/yourusername",
  },
  {
    id: "yt",
    name: "YouTube",
    placeholder: "https://youtube.com/yourusername",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LegalDocuments() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? undefined;

  const [tab, setTab] = useState<TabType>("support");
  const [expandedSection, setExpandedSection] =
    useState<ExpandedSectionType>(null);

  // Form States
  const [phones, setPhones] = useState<string[]>([""]);
  const [emails, setEmails] = useState<string[]>([""]);
  const [socials, setSocials] = useState<SocialItem[]>(
    SOCIALS.map((s) => ({ ...s, enabled: false, url: "" })),
  );
  const [kbUrl, setKbUrl] = useState("");

  // Legal Documents States
  const [tosTab, setTosTab] = useState<DocTabType>("text");
  const [tosText, setTosText] = useState(
    "TERMS OF SERVICE\n\nAlora Platform\nOwned and Operated by Northgate Support Services LLC\n\n1. Introduction",
  );
  const [ppTab, setPpTab] = useState<DocTabType>("text");
  const [ppText, setPpText] = useState(
    "PRIVACY POLICY\n\nAlora Platform\nOwned and Operated by Northgate Support Services LLC\n\n1. Introduction",
  );
  const [licTab, setLicTab] = useState<DocTabType>("text");
  const [licText, setLicText] = useState("");
  const [tosPdfFile, setTosPdfFile] = useState<File | null>(null);
  const [ppPdfFile, setPpPdfFile] = useState<File | null>(null);
  const [licPdfFile, setLicPdfFile] = useState<File | null>(null);

  const contactMutation = useSettingsMutation(
    "/settings/contactSupport",
    token,
  );
  const socialMutation = useSettingsMutation("/settings/socialLinks", token);
  const kbMutation = useSettingsMutation("/settings/knowledgeBase", token);
  const tosMutation = useSettingsMutation(
    "/settings/termsOfService",
    token,
  );
  const ppMutation = useSettingsMutation("/settings/privacyPolicy", token);
  const licMutation = useSettingsMutation(
    "/settings/licensingInformation",
    token,
  );

  const saveTerms = () => {
    if (tosTab === "pdf" && !tosPdfFile) {
      toast.error("Please select a PDF file for Terms of Service");
      return;
    }

    const body =
      tosTab === "pdf" && tosPdfFile
        ? buildDocumentFormData("termsOfServiceText", tosText, [
            "termsOfServicePdf",
            tosPdfFile,
          ])
        : { termsOfServiceText: tosText };

    tosMutation.mutate(body, { onSuccess: () => setExpandedSection(null) });
  };

  const savePrivacy = () => {
    if (ppTab === "pdf" && !ppPdfFile) {
      toast.error("Please select a PDF file for Privacy Policy");
      return;
    }

    const body =
      ppTab === "pdf" && ppPdfFile
        ? buildDocumentFormData("privacyPolicyText", ppText, [
            "privacyPolicyPdf",
            ppPdfFile,
          ])
        : { privacyPolicyText: ppText };

    ppMutation.mutate(body, { onSuccess: () => setExpandedSection(null) });
  };

  const saveLicense = () => {
    if (licTab === "pdf" && !licPdfFile) {
      toast.error("Please select a PDF file for Licensing Information");
      return;
    }

    const body =
      licTab === "pdf" && licPdfFile
        ? buildDocumentFormData("licensingInformationText", licText, [
            "licensingInformationPdf",
            licPdfFile,
          ])
        : { licensingInformationText: licText };

    licMutation.mutate(body, { onSuccess: () => setExpandedSection(null) });
  };

  // Fetch Settings
  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error("Failed to load settings");
      const json = await res.json();
      return json?.data || {};
    },
    enabled: !!token,
  });

  // Populate form with saved data
  useEffect(() => {
    if (!settings) return;

    // Contact Support
    if (settings.contactSupport?.phoneNumbers?.length) {
      setPhones(settings.contactSupport.phoneNumbers);
    }
    if (settings.contactSupport?.emailAddresses?.length) {
      setEmails(settings.contactSupport.emailAddresses);
    }

    // Social Links
    if (settings.socialLinks) {
      setSocials(
        SOCIALS.map((s) => {
          const key =
            s.id === "fb"
              ? "facebook"
              : s.id === "ig"
                ? "instagram"
                : s.id === "tt"
                  ? "tiktok"
                  : s.id === "li"
                    ? "linkedin"
                    : "youtube";

          return {
            ...s,
            enabled:
              !!settings.socialLinks?.[key as keyof typeof settings.socialLinks]
                ?.enabled,
            url:
              settings.socialLinks?.[key as keyof typeof settings.socialLinks]
                ?.url || "",
          };
        }),
      );
    }

    // Knowledge Base
    if (settings.knowledgeBase?.url) {
      setKbUrl(settings.knowledgeBase.url);
    }

    if (settings.termsOfServiceText) {
      setTosText(settings.termsOfServiceText);
    }
    if (settings.privacyPolicyText) {
      setPpText(settings.privacyPolicyText);
    }
    if (settings.licensingInformationText) {
      setLicText(settings.licensingInformationText);
    }
  }, [settings]);

  // Configured Status
  const isContactConfigured =
    phones.some((p) => p.trim()) || emails.some((e) => e.trim());
  const isSocialConfigured = socials.some((s) => s.enabled && s.url.trim());
  const isKbConfigured = !!kbUrl.trim();
  const isTermsConfigured = !!tosText.trim() || !!tosPdfFile;
  const isPrivacyConfigured = !!ppText.trim() || !!ppPdfFile;
  const isLicConfigured = !!licText.trim() || !!licPdfFile;

  // Save Handlers
  const saveContact = () => {
    const payload = {
      phoneNumbers: phones.map((p) => p.trim()).filter(Boolean),
      emailAddresses: emails.map((e) => e.trim()).filter(Boolean),
    };
    contactMutation.mutate(payload, {
      onSuccess: () => setExpandedSection(null),
    });
  };

  const saveSocial = () => {
    const payload = {
      facebook: {
        url: socials.find((s) => s.id === "fb")?.url?.trim() || "",
        enabled: !!socials.find((s) => s.id === "fb")?.enabled,
      },
      instagram: {
        url: socials.find((s) => s.id === "ig")?.url?.trim() || "",
        enabled: !!socials.find((s) => s.id === "ig")?.enabled,
      },
      tiktok: {
        url: socials.find((s) => s.id === "tt")?.url?.trim() || "",
        enabled: !!socials.find((s) => s.id === "tt")?.enabled,
      },
      linkedin: {
        url: socials.find((s) => s.id === "li")?.url?.trim() || "",
        enabled: !!socials.find((s) => s.id === "li")?.enabled,
      },
      youtube: {
        url: socials.find((s) => s.id === "yt")?.url?.trim() || "",
        enabled: !!socials.find((s) => s.id === "yt")?.enabled,
      },
    };
    socialMutation.mutate(payload, {
      onSuccess: () => setExpandedSection(null),
    });
  };

  const saveKb = () => {
    kbMutation.mutate(
      { url: kbUrl.trim() },
      { onSuccess: () => setExpandedSection(null) },
    );
  };

  const closeExpandedSection = () => setExpandedSection(null);

  // Social Helpers
  const toggleSocial = (id: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const updateSocialUrl = (id: string, url: string) => {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, url } : s)));
  };

  const addPhone = () => setPhones([...phones, ""]);
  const addEmail = () => setEmails([...emails, ""]);

  // Image Upload Handler for Quill
  const handleTermsImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const imageSrc = reader.result as string;
        setTosText(
          (prev) => `${prev}<p><img src="${imageSrc}" alt="uploaded" /></p>`,
        );
      };
      reader.readAsDataURL(file);
    };
  };

  const termsQuillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image", "blockquote"],
        ["clean"],
      ],
      handlers: { image: handleTermsImageUpload },
    },
  };

  const termsQuillFormats = [...quillFormats, "image"];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Legal & Policy Control Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading
              ? "Loading saved support resources and legal documentation..."
              : "Manage support resources and legal documentation"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {(["support", "legal"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "support" ? "Support & Resources" : "Legal"}
            </button>
          ))}
        </div>

        {/* Support Tab */}
        {tab === "support" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Contact Support */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <IconWrap>
                  <MailIcon />
                </IconWrap>
                <span className="font-semibold text-gray-900">
                  Contact Support
                </span>
              </div>
              <StatusBadge configured={isContactConfigured} />

              {expandedSection !== "contact" ? (
                <RedButton onClick={() => setExpandedSection("contact")}>
                  Configure
                </RedButton>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Phone Numbers
                  </p>
                  {phones.map((ph, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={ph}
                        onChange={(e) => {
                          const next = [...phones];
                          next[i] = e.target.value;
                          setPhones(next);
                        }}
                        placeholder="(555) 123-4567"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                      />
                      <button
                        onClick={addPhone}
                        className="w-9 h-9 bg-red-600 text-white rounded-lg text-xl flex items-center justify-center hover:bg-red-700"
                      >
                        +
                      </button>
                    </div>
                  ))}

                  <p className="text-sm font-medium text-gray-700 mb-2 mt-3">
                    Email Addresses
                  </p>
                  {emails.map((em, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        value={em}
                        onChange={(e) => {
                          const next = [...emails];
                          next[i] = e.target.value;
                          setEmails(next);
                        }}
                        placeholder="support@example.com"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                      />
                      <button
                        onClick={addEmail}
                        className="w-9 h-9 bg-red-600 text-white rounded-lg text-xl flex items-center justify-center hover:bg-red-700"
                      >
                        +
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-4">
                    <SaveButton
                      onClick={saveContact}
                      loading={contactMutation.isPending}
                    />
                    <CancelButton onClick={closeExpandedSection} />
                  </div>
                </>
              )}
            </div>

            {/* Manage Social */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <IconWrap>
                  <ShareIcon />
                </IconWrap>
                <span className="font-semibold text-gray-900">
                  Manage Social
                </span>
              </div>
              <StatusBadge configured={isSocialConfigured} />

              {expandedSection !== "social" ? (
                <RedButton onClick={() => setExpandedSection("social")}>
                  Configure
                </RedButton>
              ) : (
                <>
                  {socials.map((s) => (
                    <div key={s.id} className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {s.name}
                        </span>
                        <Toggle
                          on={s.enabled}
                          onToggle={() => toggleSocial(s.id)}
                        />
                      </div>
                      <input
                        value={s.url}
                        onChange={(e) => updateSocialUrl(s.id, e.target.value)}
                        placeholder={s.placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                      />
                    </div>
                  ))}

                  <div className="flex gap-2 mt-2">
                    <SaveButton
                      onClick={saveSocial}
                      loading={socialMutation.isPending}
                    />
                    <CancelButton onClick={closeExpandedSection} />
                  </div>
                </>
              )}
            </div>

            {/* Knowledge Base */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <IconWrap>
                  <BookIcon />
                </IconWrap>
                <span className="font-semibold text-gray-900">
                  Knowledge Base
                </span>
              </div>
              <StatusBadge configured={isKbConfigured} />

              {expandedSection !== "kb" ? (
                <RedButton onClick={() => setExpandedSection("kb")}>
                  Configure
                </RedButton>
              ) : (
                <>
                  <input
                    value={kbUrl}
                    onChange={(e) => setKbUrl(e.target.value)}
                    placeholder="Enter Knowledge Base URL (e.g., https://help.yoursite.com)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 mb-4"
                  />

                  <div className="flex gap-2">
                    <SaveButton
                      onClick={saveKb}
                      loading={kbMutation.isPending}
                    />
                    <CancelButton onClick={closeExpandedSection} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Legal Tab ── */}
        {tab === "legal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Terms of Service */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <IconWrap>
                  <ScalesIcon />
                </IconWrap>
                <span className="font-semibold text-gray-900">
                  Terms of Service
                </span>
              </div>
              <StatusBadge configured={isTermsConfigured} />
              <p className="text-xs text-gray-400 mb-3">
                Last edited by System · 1/8/2026, 12:47:53 AM
              </p>
              <DocTabSwitcher
                active={tosTab}
                onChange={setTosTab}
                textarea={
                  <div className="legal-quill mb-3">
                    <ReactQuill
                      theme="snow"
                      value={tosText}
                      onChange={setTosText}
                      modules={termsQuillModules}
                      formats={termsQuillFormats}
                      placeholder="Write terms of service..."
                    />
                  </div>
                }
                pdfInput={
                  <label className="block cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-6 text-center mb-3 transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        setTosPdfFile(e.target.files?.[0] || null)
                      }
                    />
                    <p className="text-sm text-gray-600">
                      {tosPdfFile
                        ? tosPdfFile.name
                        : "Click to select Terms of Service PDF"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Only .pdf file supported
                    </p>
                  </label>
                }
              />
              <div className="flex gap-2">
                <SaveButton
                  onClick={saveTerms}
                  loading={tosMutation.isPending}
                />
                <CancelButton onClick={closeExpandedSection} />
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <IconWrap>
                  <ShieldIcon />
                </IconWrap>
                <span className="font-semibold text-gray-900">
                  Privacy Policy
                </span>
              </div>
              <StatusBadge configured={isPrivacyConfigured} />
              <p className="text-xs text-gray-400 mb-3">
                Last edited by System · 1/8/2026, 12:47:53 AM
              </p>
              {expandedSection !== "privacy" ? (
                <>
                  <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 mb-3 min-h-[80px] max-h-[140px] overflow-hidden">
                    <div
                      className="text-xs text-gray-600 leading-relaxed [&_p]:mb-2 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_li]:mb-1"
                      dangerouslySetInnerHTML={{
                        __html: ppText || "<p>No preview available</p>",
                      }}
                    />
                  </div>
                  <RedButton onClick={() => setExpandedSection("privacy")}>
                    Configure
                  </RedButton>
                </>
              ) : (
                <>
                  <DocTabSwitcher
                    active={ppTab}
                    onChange={setPpTab}
                    textarea={
                      <div className="legal-quill mb-3">
                        <ReactQuill
                          theme="snow"
                          value={ppText}
                          onChange={setPpText}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Write privacy policy..."
                        />
                      </div>
                    }
                    pdfInput={
                      <label className="block cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-6 text-center mb-3 transition-colors">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            setPpPdfFile(e.target.files?.[0] || null)
                          }
                        />
                        <p className="text-sm text-gray-600">
                          {ppPdfFile
                            ? ppPdfFile.name
                            : "Click to select Privacy Policy PDF"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Only .pdf file supported
                        </p>
                      </label>
                    }
                  />

                  <div className="flex gap-2">
                    <SaveButton
                      onClick={savePrivacy}
                      loading={ppMutation.isPending}
                    />
                    <CancelButton onClick={closeExpandedSection} />
                  </div>
                </>
              )}
            </div>

            {/* Licensing Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <IconWrap>
                  <InfoIcon />
                </IconWrap>
                <span className="font-semibold text-gray-900">
                  Licensing Information
                </span>
              </div>
              <StatusBadge configured={isLicConfigured} />
              {expandedSection !== "license" ? (
                <RedButton onClick={() => setExpandedSection("license")}>
                  Configure
                </RedButton>
              ) : (
                <>
                  <DocTabSwitcher
                    active={licTab}
                    onChange={setLicTab}
                    textarea={
                      <div className="legal-quill mb-3">
                        <ReactQuill
                          theme="snow"
                          value={licText}
                          onChange={setLicText}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Enter licensing information..."
                        />
                      </div>
                    }
                    pdfInput={
                      <label className="block cursor-pointer border-2 border-dashed border-gray-300 hover:border-red-400 rounded-lg p-6 text-center mb-3 transition-colors">
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) =>
                            setLicPdfFile(e.target.files?.[0] || null)
                          }
                        />
                        <p className="text-sm text-gray-600">
                          {licPdfFile
                            ? licPdfFile.name
                            : "Click to select Licensing Information PDF"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Only .pdf file supported
                        </p>
                      </label>
                    }
                  />

                  <div className="flex gap-2">
                    <SaveButton
                      onClick={saveLicense}
                      loading={licMutation.isPending}
                    />
                    <CancelButton onClick={closeExpandedSection} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .legal-quill .ql-toolbar.ql-snow {
          border: 1px solid #e5e7eb;
          border-radius: 10px 10px 0 0;
          background: #f9fafb;
        }
        .legal-quill .ql-container.ql-snow {
          border: 1px solid #e5e7eb;
          border-top: 0;
          border-radius: 0 0 10px 10px;
        }
        .legal-quill .ql-editor {
          min-height: 180px;
          color: #374151;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
