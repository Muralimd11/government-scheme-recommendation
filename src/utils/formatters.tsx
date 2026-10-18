import React from "react";

/**
 * Safely decodes HTML entities like &amp;, &quot;, &#39;, &lt;, &gt;, &nbsp;
 */
export function decodeHtml(text: any): string {
  if (text === null || text === undefined) return "";
  let str = String(text);
  str = str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'");
  return str;
}

export interface BenefitItem {
  id: string;
  title: string;
  subItems: string[];
}

/**
 * Parses a benefits string (or array) into structured hierarchical bullet items
 */
export function parseBenefits(input: any): BenefitItem[] {
  if (!input) return [];

  let text = "";
  if (Array.isArray(input)) {
    text = input.map((i) => String(i)).join("\n");
  } else {
    text = String(input);
  }

  text = decodeHtml(text).trim();
  if (!text) return [];

  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const items: BenefitItem[] = [];
  let currentItem: BenefitItem | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check for main bullet: starts with '•', '***', or numbered '1.'
    if (line.startsWith("•") || line.startsWith("* •") || (line.startsWith("***") && !line.startsWith("–"))) {
      let title = line.replace(/^[\s\*•–—\-\>]+/, "").replace(/\*\*\*/g, "").trim();
      currentItem = {
        id: `b-${items.length}-${i}`,
        title,
        subItems: []
      };
      items.push(currentItem);
    } else if (line.startsWith("–") || line.startsWith("- ") || line.startsWith(">") || line.startsWith("—")) {
      // Sub-bullet
      const sub = line.replace(/^[\s–—\-\>]+/, "").trim();
      if (currentItem) {
        currentItem.subItems.push(sub);
      } else {
        // No preceding main item; create one
        currentItem = {
          id: `b-${items.length}-${i}`,
          title: sub,
          subItems: []
        };
        items.push(currentItem);
      }
    } else {
      // Generic line
      if (currentItem && currentItem.subItems.length > 0) {
        // Append to last sub-item
        currentItem.subItems[currentItem.subItems.length - 1] += " " + line;
      } else if (currentItem) {
        currentItem.title += " " + line;
      } else {
        currentItem = {
          id: `b-${items.length}-${i}`,
          title: line,
          subItems: []
        };
        items.push(currentItem);
      }
    }
  }

  // Fallback if no bullets were found at all
  if (items.length === 0 && text) {
    items.push({
      id: "b-0",
      title: text,
      subItems: []
    });
  }

  return items;
}

export function cleanBenefitSummary(benefits: any): string {
  if (!benefits) return "";
  let text = decodeHtml(String(benefits)).trim();

  // If text contains multiple bullets '•' or newlines, split them
  const parts = text
    .split(/\r?\n|[•]+/)
    .map((p) => p.replace(/^[\s\-\*–—:]+/, "").trim())
    .filter((p) => p.length > 5);

  if (parts.length === 0) return text.slice(0, 150);

  let summary = parts[0];
  if (parts.length > 1 && summary.length < 90) {
    summary += " • " + parts[1];
  }
  if (summary.length > 180) {
    summary = summary.slice(0, 177) + "...";
  }
  return summary;
}

/**
 * Parses required documents from string or array into clean individual document strings
 */
export function parseRequiredDocuments(input: any): string[] {
  if (!input) return ["Aadhaar Card", "Patta / Chitta (Land Ownership Record)", "Bank Passbook (Aadhaar linked)", "Active Mobile Number"];

  let list: string[] = [];
  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === "string") {
        const subList = item.split(/\r?\n|[•]+/).map((s) => s.trim()).filter(Boolean);
        list.push(...subList);
      } else if (item && typeof item === "object") {
        list.push(item.documentType || item.name || JSON.stringify(item));
      }
    }
  } else if (typeof input === "string") {
    list = input.split(/\r?\n|[•]+/).map((s) => s.trim()).filter(Boolean);
  }

  // Rejoin fragmented items that end with 'or' or 'and'
  const merged: string[] = [];
  for (let i = 0; i < list.length; i++) {
    let item = decodeHtml(String(list[i])).trim();
    if (!item) continue;
    if (/\b(or|and)$/i.test(item) && i + 1 < list.length) {
      item = item + " " + decodeHtml(String(list[i + 1])).trim();
      i++;
    }
    merged.push(item);
  }

  const standardRules = [
    { pattern: /aadhaar/i, label: "Aadhaar Card" },
    { pattern: /patta|chitta|land record|land ownership/i, label: "Patta / Chitta (Land Ownership Record)" },
    { pattern: /bank|passbook|account/i, label: "Bank Passbook (Aadhaar linked)" },
    { pattern: /mobile|phone/i, label: "Active Mobile Number" },
    { pattern: /caste|community/i, label: "Community / Caste Certificate" },
    { pattern: /bpl|ration|income certificate/i, label: "BPL / Ration Card" },
    { pattern: /age proof|birth/i, label: "Age Proof Certificate" },
    { pattern: /khadi|artisan/i, label: "Khadi Artisan / Institution Certificate" },
    { pattern: /project proposal|workshed/i, label: "Project Proposal / Work-shed Details" },
  ];

  const results: string[] = [];
  const seen = new Set<string>();

  for (let d of merged) {
    let cleaned = d.replace(/^[\s•\-\*\d\.\)]+/, "").trim();
    let matched = false;
    for (const rule of standardRules) {
      if (rule.pattern.test(cleaned)) {
        if (!seen.has(rule.label)) {
          seen.add(rule.label);
          results.push(rule.label);
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      cleaned = cleaned
        .replace(/\s+(or|and)$/i, "")
        .replace(/\(if applicable\)|\(if required\)/gi, "")
        .trim();
      if (cleaned.length > 3 && !seen.has(cleaned.toLowerCase())) {
        seen.add(cleaned.toLowerCase());
        const formatted = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
        results.push(formatted);
      }
    }
  }

  if (results.length === 0) {
    return ["Aadhaar Card", "Patta / Chitta (Land Ownership Record)", "Bank Passbook (Aadhaar linked)", "Active Mobile Number"];
  }

  return results.slice(0, 5);
}

/**
 * Component to render structured benefits with main bullets and sub-bullets
 */
export const FormattedBenefitsView: React.FC<{
  benefits: any;
  variant?: "full" | "compact";
  className?: string;
}> = ({ benefits, variant = "full", className = "" }) => {
  const items = parseBenefits(benefits);

  if (items.length === 0) {
    return <p className="text-xs text-neutral-600">Standard agricultural welfare benefits apply.</p>;
  }

  if (variant === "compact") {
    // For cards, show up to 3 items cleanly
    return (
      <div className={`space-y-1.5 text-xs ${className}`}>
        {items.slice(0, 3).map((item, idx) => (
          <div key={item.id || idx} className="flex items-start gap-1.5 text-slate-800">
            <span className="text-emerald-700 font-bold shrink-0 mt-0.5">•</span>
            <div className="leading-snug">
              <span className="font-semibold text-slate-900">{item.title}</span>
              {item.subItems.length > 0 && (
                <span className="text-slate-600 ml-1">
                  — {item.subItems[0]}
                </span>
              )}
            </div>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-[11px] text-emerald-800 font-semibold pt-1">
            + {items.length - 3} more scheme benefit provisions (Click to view full details)
          </p>
        )}
      </div>
    );
  }

  // Full detailed display for Scheme Detail Page & Recommendation Cards
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, idx) => (
        <div key={item.id || idx} className="border-b border-emerald-100/60 pb-2.5 last:border-0 last:pb-0">
          <div className="flex items-start gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {item.title}
            </h4>
          </div>

          {item.subItems.length > 0 && (
            <ul className="mt-1.5 ml-4 pl-2 border-l-2 border-emerald-200/80 space-y-1">
              {item.subItems.map((sub, sIdx) => (
                <li key={sIdx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                  <span className="text-emerald-500 font-medium shrink-0">–</span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};
