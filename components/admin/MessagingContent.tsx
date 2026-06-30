"use client";

import Image from "next/image";
import { useState } from "react";

const contacts = [
  {
    name: "Robert Peterson",
    preview: "Follow-up on MRI results...",
    time: "10:24 AM",
    online: true,
    active: true,
    badge: null,
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxa0EH42oehjmgTSySVGvdaD8FA7TzFjvByQkjgB4EQ1HQBvLqf_yU5V4exGNGNoKfsFu0l9GOd3saZ3aPTnE6XiLgKyNiSu0lYSHI0F2XJvs_ON9LAfGC_Fe_anH6F2DiP6fd9H7Qhm7re_PxiYrsQ96-pg0E6FweZg8J3Pd8MkMAou73Sxghy35MdzKpQbAAfjy8gjnl3QrK16GR8KVCNSQvTw9atjIRP9rOTLHTiee8U2n_uZcYNEGtr59bdnu1QbReZ97Es4s",
  },
  {
    name: "Sarah Jenkins",
    preview: "Thank you for the prescription adjustment.",
    time: "Yesterday",
    online: false,
    active: false,
    badge: "2",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAolaWHwPKRMeClsVFHTxtQMHXpM5xifheC-IAYsyqyVnzkCD39ut4ofI4fyU-0QN1_dACGsqReDzJoED6SLHlau5l1KQlVuyMWFZUTi_A1MEKt-KH7bPvSyEhgl0P0I6KGKFZkxltyDudKhShuXk90lS4801mFv7sREVoiXrLx3znfXZvMVkWXkkKthqo53onGXL5CYJ9mpIXntKYcBYQvPTNoPdld4mgQmUGtL43hjMCLkvY8H6m1_MeRwaYZdFgpheJxLo2Jcmg",
  },
  {
    name: "Michael Chen",
    preview: "The symptoms have subsided significantly.",
    time: "Mon",
    online: false,
    active: false,
    badge: null,
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX0SZD1Wr9SbeFNJqP-2Tb8RPjE4puAMD1TqV6gd2ltS0PlW3a5z2KSiO8ll9y7kAoKCn1BklSjoooylnyjKpZARrOLL_P9IWuhs3P4wD8sQIlu1xjqDlBEeEVCpfrtByXff6W0YZP3VJREIrj_icjqliNNSJG6GRecp0j1_IF6WCvamGgeeqNAeqei2N5r6s0KLGYwrq_vmUn33VDGdcV8kR0u1QIQ1ySHnyWjqBM3R-qn5_-f2-lEinTZMgBuAqdTnlYJCF2x24",
  },
];

const patientSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuCLo6mjfP-GYH5cDNqhGoSW4PaXt9nQRta7a3ObKyVxYJR-0qXl0fWN1_xh-e-Q2gI-s96I9ixGfpHgpYyZaPH-nUhGviYcATeCgvJ2vy6xrdImWCJy98bMioKJVG7o-_Es75bMah_931PFXkWB0fphD6NYtaWbnyIA4UnuF_Its8FhDmZ6ZXzoom_xhOF35tIaJdzSVyuBDCSKLItHpFFVoFbt2ekwd1T1S5aYOGWXBWeHYsmAWTu9exjeAz_OyQXAUiUwN4KFzpw";

export default function MessagingContent() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      {/* Pane 1: Contact List */}
      <section className="w-80 border-r border-outline-variant bg-surface flex flex-col shrink-0">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-headline-md font-semibold text-on-surface">Chats</h2>
          <button className="p-xs hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-primary">edit_square</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map((c) => (
            <div key={c.name} className={`p-md cursor-pointer transition-colors border-b border-outline-variant/30 ${c.active ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-surface-container-low"}`}>
              <div className="flex gap-sm">
                <div className="relative shrink-0">
                  <Image src={c.src} alt={c.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" unoptimized />
                  {c.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-xs">
                    <h3 className={`text-label-md truncate ${c.active ? "font-bold text-on-surface" : "font-medium text-on-surface"}`}>{c.name}</h3>
                    <span className="text-caption text-on-surface-variant shrink-0">{c.time}</span>
                  </div>
                  <p className={`text-caption truncate ${c.active ? "font-semibold text-primary" : "text-on-surface-variant"}`}>{c.preview}</p>
                </div>
                {c.badge && (
                  <span className="shrink-0 bg-primary text-on-primary text-[10px] px-xs py-0.5 rounded-full font-bold self-start">{c.badge}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pane 2: Chat Window */}
      <section className="flex-1 flex flex-col bg-surface-container-lowest min-w-0">
        {/* Chat Header */}
        <div className="h-20 border-b border-outline-variant flex items-center justify-between px-md bg-surface-container-lowest/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-md">
            <Image src={contacts[0].src} alt="Robert Peterson" width={40} height={40} className="w-10 h-10 rounded-full object-cover" unoptimized />
            <div>
              <h2 className="text-body-md font-bold text-on-surface">Robert Peterson</h2>
              <p className="text-caption text-primary flex items-center gap-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" /> Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-xs">
            {["videocam","call","more_vert"].map((icon) => (
              <button key={icon} className="p-xs hover:bg-surface-container-high rounded-lg text-on-surface-variant">
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-xl space-y-md bg-slate-50/50">
          <div className="flex justify-center">
            <span className="px-sm py-xs bg-surface-container-high rounded-full text-caption text-on-surface-variant font-medium">Today</span>
          </div>
          {/* Patient message */}
          <div className="flex items-start gap-sm max-w-[80%]">
            <Image src={patientSrc} alt="Robert" width={32} height={32} className="w-8 h-8 rounded-full object-cover mt-xs" unoptimized />
            <div>
              <div className="bg-surface border border-outline-variant rounded-2xl rounded-tl-none p-md shadow-sm">
                <p className="text-body-md text-on-surface">Hello Dr. Specialist, I&apos;ve received the MRI results notification. Could you help me understand the findings regarding the L4-L5 disc? I&apos;m still feeling some numbness in my left leg.</p>
              </div>
              <span className="text-caption text-on-surface-variant mt-xs ml-xs">10:12 AM</span>
            </div>
          </div>
          {/* Doctor message */}
          <div className="flex flex-row-reverse items-start gap-sm max-w-[80%] ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-xs text-[10px] text-on-primary font-bold shrink-0">DS</div>
            <div className="flex flex-col items-end">
              <div className="bg-primary-container text-on-primary-container rounded-2xl rounded-tr-none p-md shadow-sm">
                <p className="text-body-md">Good morning, Robert. I&apos;ve just reviewed the scans. There is a mild protrusion at L4-L5 which explains the nerve irritation. It&apos;s nothing that requires surgery at this stage.</p>
              </div>
              <div className="flex items-center gap-xs mt-xs mr-xs">
                <span className="text-caption text-on-surface-variant">10:24 AM</span>
                <span className="material-symbols-outlined text-[16px] text-primary">done_all</span>
              </div>
            </div>
          </div>
          {/* Patient follow-up */}
          <div className="flex items-start gap-sm max-w-[80%]">
            <Image src={patientSrc} alt="Robert" width={32} height={32} className="w-8 h-8 rounded-full object-cover mt-xs" unoptimized />
            <div>
              <div className="bg-surface border border-outline-variant rounded-2xl rounded-tl-none p-md shadow-sm">
                <p className="text-body-md">That&apos;s a relief. What would you recommend for the next steps? Should I continue the physical therapy?</p>
              </div>
              <span className="text-caption text-on-surface-variant mt-xs ml-xs">10:25 AM</span>
            </div>
          </div>
          {/* Typing indicator */}
          <div className="flex items-start gap-sm">
            <div className="bg-surface-container-high rounded-full px-md py-xs flex gap-xs">
              {[0,1,2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: `${i * -0.15}s` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-md bg-surface border-t border-outline-variant">
          <div className="flex items-end gap-md bg-surface-container-low border border-outline-variant rounded-2xl p-xs focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <button className="p-xs text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-body-md py-xs resize-none max-h-32"
              placeholder="Type a clinical response..."
              rows={1}
            />
            <button className="bg-primary text-on-primary p-sm rounded-xl hover:bg-primary/90 transition-all shadow-md">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
          <div className="flex gap-md mt-sm ml-xs">
            <button className="text-caption text-primary hover:underline flex items-center gap-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">bolt</span> Quick Templates
            </button>
            <button className="text-caption text-on-surface-variant hover:underline flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">lock</span> HIPAA Secure
            </button>
          </div>
        </div>
      </section>

      {/* Pane 3: Patient Summary */}
      <section className="w-72 border-l border-outline-variant bg-surface flex flex-col p-md overflow-y-auto shrink-0">
        <div className="text-center mb-xl">
          <Image
            src={contacts[0].src} alt="Robert Peterson" width={96} height={96}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-md border-4 border-surface-container-highest shadow-sm" unoptimized
          />
          <h2 className="text-headline-md text-on-surface">Robert Peterson</h2>
          <p className="text-caption text-on-surface-variant mb-md">Patient ID: #MED-88421</p>
          <div className="flex justify-center gap-xs">
            <span className="px-sm py-xs bg-secondary/10 text-secondary rounded-full text-caption font-bold">Chronic Care</span>
            <span className="px-sm py-xs bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-caption font-bold">Priority</span>
          </div>
        </div>
        <div className="space-y-lg">
          <div>
            <h4 className="text-label-md font-bold text-on-surface-variant mb-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">info</span> Patient Information
            </h4>
            <div className="space-y-sm">
              {[["Phone","+1 (555) 012-3456"],["Date of Birth","Oct 12, 1954 (69)"],["Blood Type","A+ Positive"]].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-caption text-on-surface-variant">{k}</span>
                  <span className="text-caption font-semibold text-on-surface">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-md bg-surface-container-high rounded-2xl border border-outline-variant/30">
            <h4 className="text-label-md font-bold text-on-surface-variant mb-xs">Next Appointment</h4>
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 bg-primary-container rounded-xl flex flex-col items-center justify-center text-on-primary-container">
                <span className="text-[10px] font-bold">NOV</span>
                <span className="text-label-md font-extrabold leading-none">04</span>
              </div>
              <div>
                <p className="text-caption font-bold text-on-surface">Follow-up Consultation</p>
                <p className="text-caption text-on-surface-variant">09:30 AM — Room 302</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-label-md font-bold text-on-surface-variant mb-sm flex items-center justify-between">
              Recent Documents
              <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-primary">open_in_new</span>
            </h4>
            <ul className="space-y-xs">
              {[["picture_as_pdf","text-error","MRI_Scan_Lumbar.pdf","Oct 26, 2023 • 4.2 MB"],["description","text-primary","Physio_Plan_Phase1.docx","Oct 15, 2023 • 1.1 MB"]].map(([icon,cls,name,meta]) => (
                <li key={name} className="flex items-center gap-sm p-xs hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30">
                  <span className={`material-symbols-outlined ${cls}`}>{icon}</span>
                  <div className="min-w-0">
                    <p className="text-caption font-semibold truncate text-on-surface">{name}</p>
                    <p className="text-[10px] text-on-surface-variant">{meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-auto pt-md border-t border-outline-variant flex gap-xs">
          <button className="flex-1 border border-outline-variant text-on-surface py-xs rounded-xl text-caption font-bold hover:bg-surface-container-high transition-colors">View Profile</button>
          <button className="p-xs border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">flag</span>
          </button>
        </div>
      </section>
    </div>
  );
}
