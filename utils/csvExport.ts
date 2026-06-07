
import { BusinessLead } from "../types";

export const exportToCSV = (leads: BusinessLead[], city: string, type: string) => {
  if (leads.length === 0) return;

  const headers = [
    "Name", "Category", "Description", "Website", "Has Website", 
    "Email", "Phone", "Address", "City", "State", "ZIP", 
    "Score", "Opportunities", "Tech Stack", "Facebook", "Instagram", "LinkedIn"
  ];

  const rows = leads.map(lead => [
    `"${lead.name.replace(/"/g, '""')}"`,
    `"${lead.category}"`,
    `"${lead.description?.replace(/"/g, '""') || ''}"`,
    `"${lead.website}"`,
    lead.hasWebsite ? "Yes" : "No",
    `"${lead.email}"`,
    `"${lead.phone}"`,
    `"${lead.address.replace(/"/g, '""')}"`,
    `"${lead.city}"`,
    `"${lead.state}"`,
    `"${lead.zip}"`,
    lead.score,
    `"${lead.opportunities.join(", ")}"`,
    `"${lead.techStack.join(", ")}"`,
    `"${lead.socialLinks?.facebook || ''}"`,
    `"${lead.socialLinks?.instagram || ''}"`,
    `"${lead.socialLinks?.linkedin || ''}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_');
  link.setAttribute("href", url);
  link.setAttribute("download", `leads_${type.toLowerCase()}_${city.toLowerCase()}_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
